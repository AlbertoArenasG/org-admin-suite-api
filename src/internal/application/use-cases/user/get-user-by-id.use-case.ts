import { Inject, Injectable } from '@nestjs/common';

import {
  IUserReadRepository,
  IUserReadRepositoryToken,
} from '@domain/ports/repositories';
import {
  AuthorizationException,
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
} from '@domain/exceptions';
import { SystemRole, User, UserStatus } from '@domain/entities';
import { UserViewDto } from '@application/dto';
import { UserResultMapper } from '@application/mappers';

@Injectable()
export class GetUserByIdUseCase {
  constructor(
    @Inject(IUserReadRepositoryToken)
    private readonly userReadRepository: IUserReadRepository,
  ) {}

  async execute(
    userId: string,
    actorSystemRole: SystemRole,
  ): Promise<UserViewDto> {
    const { data } = await this.userReadRepository.findById(userId);

    if (!data || data.status === UserStatus.DELETED) {
      throw EntityNotFoundException.create(EntityNotFoundExceptionCode.USER, {
        userId,
      });
    }

    if (
      actorSystemRole !== SystemRole.MASTER_ADMIN &&
      User.isMasterSystemRole(data.systemRole)
    ) {
      throw AuthorizationException.masterPrivilegesRequired();
    }

    return UserResultMapper.toUserViewDto(data);
  }
}
