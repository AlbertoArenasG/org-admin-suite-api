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
import { User, UserStatus } from '@domain/entities';
import { UserViewDto } from '@application/dto';
import { UserResultMapper } from '@application/mappers';

@Injectable()
export class GetUserByIdUseCase {
  constructor(
    @Inject(IUserReadRepositoryToken)
    private readonly userReadRepository: IUserReadRepository,
  ) {}

  async execute(userId: string, actorIsMaster: boolean): Promise<UserViewDto> {
    const { data } = await this.userReadRepository.findById(userId);

    if (!data || data.status === UserStatus.DELETED) {
      throw EntityNotFoundException.create(EntityNotFoundExceptionCode.USER, {
        userId,
      });
    }

    if (!actorIsMaster && User.isMasterSystemRole(data.systemRole)) {
      throw AuthorizationException.masterPrivilegesRequired();
    }

    return UserResultMapper.toUserViewDto(data);
  }
}
