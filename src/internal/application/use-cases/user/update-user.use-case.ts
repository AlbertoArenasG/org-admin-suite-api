import { Inject, Injectable } from '@nestjs/common';

import {
  IRoleReadRepository,
  IRoleReadRepositoryToken,
  IUserReadRepository,
  IUserReadRepositoryToken,
  IUserWriteRepository,
  IUserWriteRepositoryToken,
} from '@domain/ports/repositories';
import {
  EntityAlreadyExistsException,
  EntityAlreadyExistsExceptionCode,
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
  InvalidValueException,
  InvalidValueExceptionCode,
} from '@domain/exceptions';
import { UpdateUserDto, UpdateUserResultDto } from '@application/dto';
import { UserResultMapper } from '@application/mappers';
import { UserStatus } from '@domain/entities';
import { AuthorizationService } from '@application/services';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject(IUserReadRepositoryToken)
    private readonly userReadRepository: IUserReadRepository,
    @Inject(IRoleReadRepositoryToken)
    private readonly roleReadRepository: IRoleReadRepository,
    @Inject(IUserWriteRepositoryToken)
    private readonly userWriteRepository: IUserWriteRepository,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async execute(input: UpdateUserDto): Promise<UpdateUserResultDto> {
    const { userId, actorSystemRole, actorUserId, payload } = input;

    const { data: user } = await this.userReadRepository.findById(userId);

    if (!user || user.status === UserStatus.DELETED) {
      throw EntityNotFoundException.create(EntityNotFoundExceptionCode.USER, {
        userId,
      });
    }

    const isSelfUpdate = actorUserId === userId;

    if (!isSelfUpdate) {
      this.authorizationService.ensureHasHigherPrivileges(
        actorSystemRole,
        user.systemRole,
      );
    }

    if (payload.systemRole !== undefined || payload.roleId !== undefined) {
      const nextSystemRole = payload.systemRole ?? user.systemRole;

      if (
        isSelfUpdate &&
        (nextSystemRole !== user.systemRole ||
          (payload.roleId ?? user.roleId) !== user.roleId)
      ) {
        throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
          field:
            payload.systemRole !== undefined &&
            payload.systemRole !== user.systemRole
              ? 'system_role'
              : 'role_id',
        });
      }

      await this.authorizationService.ensureCanUpdateUser(
        {
          userId: actorUserId,
          systemRole: actorSystemRole,
          roleId: null,
        },
        {
          currentSystemRole: user.systemRole,
          nextSystemRole,
          nextRoleId: payload.roleId ?? user.roleId,
          isSelfUpdate,
        },
      );
      user.updateAuthorization({
        systemRole: nextSystemRole,
        roleId: payload.roleId ?? user.roleId,
      });
    }

    if (payload.status !== undefined) {
      if (isSelfUpdate && payload.status !== user.status) {
        throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
          field: 'status',
        });
      }
      if (payload.status === UserStatus.DELETED) {
        throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
          field: 'status',
        });
      }
      user.updateStatus(payload.status);
    }

    if (payload.email !== undefined && payload.email !== user.email) {
      const { data: existing } = await this.userReadRepository.findByEmail(
        payload.email,
      );

      if (existing && existing.id !== user.id) {
        throw EntityAlreadyExistsException.create(
          EntityAlreadyExistsExceptionCode.USER_EMAIL,
          { email: payload.email },
        );
      }
    }

    const details: {
      name?: string;
      lastname?: string;
      email?: string;
      cellPhone?: {
        countryCode: string | null;
        number: string | null;
      } | null;
    } = {};

    if (payload.name !== undefined) {
      details.name = payload.name;
    }

    if (payload.lastname !== undefined) {
      details.lastname = payload.lastname;
    }

    if (payload.email !== undefined) {
      details.email = payload.email;
    }

    if (payload.cellPhone !== undefined) {
      details.cellPhone = payload.cellPhone;
    }

    if (Object.keys(details).length > 0) {
      user.updateDetails(details);
    }

    const { data: updated } = await this.userWriteRepository.update(user);

    if (!updated) {
      throw EntityNotFoundException.create(EntityNotFoundExceptionCode.USER, {
        userId,
      });
    }

    const roleName = updated.roleId
      ? ((await this.roleReadRepository.findById(updated.roleId)).data?.name ??
        null)
      : null;

    return UserResultMapper.toUserViewDto(updated, roleName);
  }
}
