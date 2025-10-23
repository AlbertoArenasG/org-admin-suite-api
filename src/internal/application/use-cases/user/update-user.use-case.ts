import { Inject, Injectable } from '@nestjs/common';

import {
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
import { UserRolePolicy } from '@domain/policies';
import { UpdateUserDto, UpdateUserResultDto } from '@application/dto';
import { UserResultMapper } from '@application/mappers';
import { UserStatus } from '@domain/entities';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject(IUserReadRepositoryToken)
    private readonly userReadRepository: IUserReadRepository,
    @Inject(IUserWriteRepositoryToken)
    private readonly userWriteRepository: IUserWriteRepository,
  ) {}

  async execute(input: UpdateUserDto): Promise<UpdateUserResultDto> {
    const { userId, actorRole, payload } = input;

    const { data: user } = await this.userReadRepository.findById(userId);

    if (!user || user.status === UserStatus.DELETED) {
      throw EntityNotFoundException.create(EntityNotFoundExceptionCode.USER, {
        userId,
      });
    }

    UserRolePolicy.ensureHasHigherPrivileges(actorRole, user.role);

    if (payload.role !== undefined) {
      UserRolePolicy.ensureCanManageRole(actorRole, payload.role);
      user.updateRole(payload.role);
    }

    if (payload.status !== undefined) {
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

    return UserResultMapper.toUserViewDto(updated);
  }
}
