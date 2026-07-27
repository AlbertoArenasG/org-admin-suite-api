import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import {
  IUserReadRepository,
  IUserReadRepositoryToken,
  IUserWriteRepository,
  IUserWriteRepositoryToken,
} from '@domain/ports/repositories';
import { NotificationType, User, UserStatus, UserRole } from '@domain/entities';
import { UserPasswordPolicy, UserRolePolicy } from '@domain/policies';
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
    private readonly notifier: UserNotifierService,
  ) {}

  /**
   * Creates a new user in the database if it doesn't already exist
   * or updates an existing user with the given data.
   * @param input The data to create the user with
   * @returns A promise that resolves to the created user
   */
  async execute(
    input: CreateUserDto,
    actorRole: UserRole,
  ): Promise<CreateUserResultDto> {
    UserRolePolicy.ensureCanManageRole(actorRole, input.role);

    const existingUser = await this.findUserByEmail(input.email);

    if (existingUser) {
      throw EntityAlreadyExistsException.create(
        EntityAlreadyExistsExceptionCode.USER_EMAIL,
        { email: input.email },
      );
    }

    const user = await this.createUser(input);

    return UserResultMapper.toCreateUserResultDto(user);
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
      role: input.role,
      systemRole: input.systemRole,
      roleId: input.roleId ?? null,
      status: UserStatus.ACTIVE,
      cellPhone: input.cellPhone,
    });

    const { data } = await this.userWriteRepo.create(user);

    await this.notifier.notify(data, NotificationType.WELCOME_USER);
    data.markAsCreated();

    return data;
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
