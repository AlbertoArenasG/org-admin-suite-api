import { Inject, Injectable } from '@nestjs/common';

import {
  IRoleReadRepository,
  IRoleReadRepositoryToken,
  IUserReadRepository,
  IUserReadRepositoryToken,
  IUserWriteRepository,
  IUserWriteRepositoryToken,
  IUserCustomerRelationshipWriteRepository,
  IUserCustomerRelationshipWriteRepositoryToken,
} from '@domain/ports/repositories';
import {
  ITransactionalExecutor,
  ITransactionalExecutorToken,
} from '@domain/ports/services';
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
import {
  SystemRole,
  UserCustomerRelationship,
  UserStatus,
} from '@domain/entities';
import {
  AuthorizationService,
  SyncUserContactService,
  UserCustomerCompanyNamesResolver,
  UserCustomerRelationshipValidationService,
} from '@application/services';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject(IUserReadRepositoryToken)
    private readonly userReadRepository: IUserReadRepository,
    @Inject(IRoleReadRepositoryToken)
    private readonly roleReadRepository: IRoleReadRepository,
    @Inject(IUserWriteRepositoryToken)
    private readonly userWriteRepository: IUserWriteRepository,
    @Inject(IUserCustomerRelationshipWriteRepositoryToken)
    private readonly relationshipWriteRepository: IUserCustomerRelationshipWriteRepository,
    @Inject(ITransactionalExecutorToken)
    private readonly transactionalExecutor: ITransactionalExecutor,
    private readonly authorizationService: AuthorizationService,
    private readonly syncUserContactService: SyncUserContactService,
    private readonly relationshipValidationService: UserCustomerRelationshipValidationService,
    private readonly companyNamesResolver: UserCustomerCompanyNamesResolver,
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

    if (
      payload.customerIds !== undefined &&
      user.systemRole !== SystemRole.USER
    ) {
      throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
        field: 'customer_ids',
        systemRole: user.systemRole,
      });
    }

    const customerIds =
      payload.customerIds === undefined
        ? undefined
        : await this.relationshipValidationService.validateCustomerIds(
            payload.customerIds,
            user.systemRole,
          );

    const updated = await this.transactionalExecutor.execute(async () => {
      const { data } = await this.userWriteRepository.update(user);

      if (!data) {
        throw EntityNotFoundException.create(EntityNotFoundExceptionCode.USER, {
          userId,
        });
      }

      if (customerIds !== undefined) {
        await this.relationshipWriteRepository.replaceForUser(
          data.id,
          customerIds.map(
            (customerId) =>
              new UserCustomerRelationship({
                userId: data.id,
                customerId,
              }),
          ),
        );

        const [resolution] = await this.companyNamesResolver.resolveForUserIds([
          data.id,
        ]);
        await this.syncUserContactService.syncFromUser(data, {
          companyNames: resolution.companyNames,
        });
      } else {
        await this.syncUserContactService.syncFromUser(data);
      }

      return data;
    });

    const roleName = updated.roleId
      ? ((await this.roleReadRepository.findById(updated.roleId)).data?.name ??
        null)
      : null;

    return UserResultMapper.toUserViewDto(updated, roleName);
  }
}
