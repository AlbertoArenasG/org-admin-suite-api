import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import {
  IUserReadRepository,
  IUserReadRepositoryToken,
  IUserWriteRepository,
  IUserWriteRepositoryToken,
  ITenantUserReadRepository,
  ITenantUserReadRepositoryToken,
  ITenantUserWriteRepository,
  ITenantUserWriteRepositoryToken,
} from '@domain/ports/repositories';
import {
  NotificationType,
  TenantUser,
  TenantUserStatus,
  User,
  UserRole,
  UserStatus,
} from '@domain/entities';
import { UserPasswordPolicy } from '@domain/policies';
import {
  EntityAlreadyExistsException,
  EntityAlreadyExistsExceptionCode,
} from '@domain/exceptions';
import { CreateUserDto, CreateUserResultDto } from '@application/dto';
import { UserResultMapper } from '@application/mappers';
import { UserNotifierService } from '@application/services';

@Injectable()
export class CreateUserAndNotifyUseCase {
  constructor(
    @Inject(IUserReadRepositoryToken)
    private readonly userReadRepo: IUserReadRepository,
    @Inject(IUserWriteRepositoryToken)
    private readonly userWriteRepo: IUserWriteRepository,
    @Inject(ITenantUserReadRepositoryToken)
    private readonly tenantUserReadRepo: ITenantUserReadRepository,
    @Inject(ITenantUserWriteRepositoryToken)
    private readonly tenantUserWriteRepo: ITenantUserWriteRepository,
    private readonly notifier: UserNotifierService,
  ) {}

  /**
   * Creates a new user in the database if it doesn't already exist
   * or updates an existing user with the given data.
   * @param input The data to create the user with
   * @returns A promise that resolves to the created user
   */
  async execute(input: CreateUserDto): Promise<CreateUserResultDto> {
    const existingUser = await this.findUserByEmail(input.email);

    const user = existingUser ?? (await this.createUser(input));

    await this.ensureTenantUserUnique(user.id, input.tenantId, input.email);

    const tenantUser = new TenantUser({
      tenantId: input.tenantId,
      userId: user.id,
      role: input.role,
      status: TenantUserStatus.ACTIVE,
    });

    const { data: persistedTenantUser } =
      await this.tenantUserWriteRepo.create(tenantUser);

    persistedTenantUser.markAsCreated();

    return UserResultMapper.toCreateTenantUserResultDto(
      user,
      persistedTenantUser,
    );
  }

  /**
   * Creates a new user in the database
   * @param input The data to create the user with
   * @returns A promise that resolves to the created user
   */
  private async createUser(input: CreateUserDto): Promise<User> {
    UserPasswordPolicy.ensureSecure(input.password);

    const hashedPassword = await this.hashPassword(input.password);

    const user = new User({
      name: input.name,
      lastname: input.lastname,
      email: input.email,
      password: hashedPassword,
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      cellPhone: input.cellPhone,
    });

    const { data } = await this.userWriteRepo.create(user);

    await this.notifier.notify(data, NotificationType.WELCOME_USER);
    data.markAsCreated();

    return data;
  }

  /**
   * Ensures that a tenant user with the given user id and tenant id does not already exist
   * @param userId The id of the user to check
   * @param tenantId The id of the tenant to check
   * @param email The email of the tenant user to check
   * @throws EntityAlreadyExistsException If a tenant user with the given user id and tenant id already exists
   */
  private async ensureTenantUserUnique(
    userId: string,
    tenantId: string,
    email: string,
  ): Promise<void> {
    const { data } = await this.tenantUserReadRepo.findManyByUserId(userId);

    const alreadyExists = data.some(
      (tenantUser) => tenantUser.tenantId === tenantId && tenantUser.id,
    );

    if (alreadyExists) {
      throw EntityAlreadyExistsException.create(
        EntityAlreadyExistsExceptionCode.TENANT_USER_EMAIL,
        { userId, tenantId, email },
      );
    }
  }

  private async findUserByEmail(email: string): Promise<User | null> {
    const { data } = await this.userReadRepo.findByEmail(email);
    return data ?? null;
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }
}
