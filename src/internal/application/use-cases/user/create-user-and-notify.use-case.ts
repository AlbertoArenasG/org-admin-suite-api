import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import {
  IUserReadRepository,
  IUserReadRepositoryToken,
  IUserWriteRepository,
  IUserWriteRepositoryToken,
} from '@domain/ports/repositories';
import {
  ITransactionalExecutor,
  ITransactionalExecutorToken,
} from '@domain/ports/services';
import {
  NotificationType,
  SystemRole,
  User,
  UserStatus,
} from '@domain/entities';
import { UserInternalStaffPolicy, UserPasswordPolicy } from '@domain/policies';
import {
  EntityAlreadyExistsException,
  EntityAlreadyExistsExceptionCode,
} from '@domain/exceptions';
import { CreateUserDto, CreateUserResultDto } from '@application/dto';
import { UserResultMapper } from '@application/mappers';
import {
  AuthorizationService,
  SyncUserContactService,
  UserCustomerRelationshipManagerService,
  UserNotifierService,
} from '@application/services';

@Injectable()
export class CreateUserAndNotifyUseCase {
  constructor(
    @Inject(IUserReadRepositoryToken)
    private readonly userReadRepo: IUserReadRepository,
    @Inject(IUserWriteRepositoryToken)
    private readonly userWriteRepo: IUserWriteRepository,
    @Inject(ITransactionalExecutorToken)
    private readonly transactionalExecutor: ITransactionalExecutor,
    private readonly notifier: UserNotifierService,
    private readonly authorizationService: AuthorizationService,
    private readonly syncUserContactService: SyncUserContactService,
    private readonly relationshipManagerService: UserCustomerRelationshipManagerService,
  ) {}

  /**
   * Creates a new user in the database if it doesn't already exist
   * or updates an existing user with the given data.
   * @param input The data to create the user with
   * @returns A promise that resolves to the created user
   */
  async execute(
    input: CreateUserDto,
    actorSystemRole: SystemRole,
  ): Promise<CreateUserResultDto> {
    await this.authorizationService.ensureCanCreateUser(
      {
        userId: 'system',
        systemRole: actorSystemRole,
        roleId: null,
      },
      {
        systemRole: input.systemRole,
        roleId: input.roleId,
      },
    );

    const existingUser = await this.findUserByEmail(input.email);

    if (existingUser) {
      throw EntityAlreadyExistsException.create(
        EntityAlreadyExistsExceptionCode.USER_EMAIL,
        { email: input.email },
      );
    }

    const user = await this.transactionalExecutor.execute(async () => {
      const createdUser = await this.createUser(input);

      if (input.customerId !== undefined) {
        await this.relationshipManagerService.replaceForUser({
          user: createdUser,
          customerIds: [input.customerId],
        });
      }

      await this.syncUserContactService.syncFromUser(createdUser);

      return createdUser;
    });

    await this.notifier.notify(user, NotificationType.WELCOME_USER);
    user.markAsCreated();

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
      systemRole: input.systemRole,
      roleId: input.roleId,
      isInternalStaff: UserInternalStaffPolicy.resolve(
        input.systemRole,
        input.isInternalStaff,
      ),
      status: UserStatus.ACTIVE,
      cellPhone: input.cellPhone,
    });

    const { data } = await this.userWriteRepo.create(user);

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
