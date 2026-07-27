import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import {
  IUserReadRepository,
  IUserReadRepositoryToken,
  IUserWriteRepository,
  IUserWriteRepositoryToken,
} from '@domain/ports/repositories';
import {
  NotificationType,
  SystemRole,
  User,
  UserStatus,
  UserRole,
} from '@domain/entities';
import { UserPasswordPolicy, UserRolePolicy } from '@domain/policies';
import {
  EntityAlreadyExistsException,
  EntityAlreadyExistsExceptionCode,
} from '@domain/exceptions';
import {
  CreateMasterUserDto,
  CreateMasterUserResultDto,
} from '@application/dto';
import { UserResultMapper } from '@application/mappers';
import { UserNotifierService } from '@application/services';

@Injectable()
export class CreateMasterUserAndNotifyUseCase {
  constructor(
    @Inject(IUserReadRepositoryToken)
    private readonly userReadRepo: IUserReadRepository,
    @Inject(IUserWriteRepositoryToken)
    private readonly userWriteRepo: IUserWriteRepository,
    private readonly notifier: UserNotifierService,
  ) {}

  /**
   * Creates a new master user in the database if it doesn't already exist
   * or updates an existing master user with the given data.
   * @param input The data to create the master user with
   * @returns A promise that resolves to the created master user
   */
  async execute(
    input: CreateMasterUserDto,
    actorRole: UserRole,
  ): Promise<CreateMasterUserResultDto> {
    UserRolePolicy.ensureCanManageRole(
      actorRole,
      input.systemRole ?? input.role ?? SystemRole.MASTER_ADMIN,
    );

    await this.ensureUserUnique(input.email);

    UserPasswordPolicy.ensureSecure(input.password);

    const hashedPassword = await this.hashPassword(input.password);

    const user = new User({
      name: input.name,
      lastname: input.lastname,
      email: input.email,
      password: hashedPassword,
      role: input.role,
      systemRole:
        input.systemRole ??
        User.resolveSystemRoleFromLegacyRole(
          input.role ?? UserRole.MASTER_ADMIN,
        ),
      roleId: input.roleId ?? null,
      status: UserStatus.ACTIVE,
      cellPhone: input.cellPhone,
    });

    const { data } = await this.userWriteRepo.create(user);

    await this.notifier.notify(data, NotificationType.WELCOME_USER);
    data.markAsCreated();

    return UserResultMapper.toCreateMasterUserResultDto(data);
  }

  private async ensureUserUnique(email: string): Promise<void> {
    const { data } = await this.userReadRepo.findByEmail(email);

    if (data) {
      throw EntityAlreadyExistsException.create(
        EntityAlreadyExistsExceptionCode.USER_EMAIL,
        { email },
      );
    }
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }
}
