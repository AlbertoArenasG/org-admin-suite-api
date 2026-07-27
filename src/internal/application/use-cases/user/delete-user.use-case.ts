import { Inject, Injectable } from '@nestjs/common';

import { DeleteUserDto } from '@application/dto';
import {
  IUserReadRepository,
  IUserReadRepositoryToken,
  IUserWriteRepository,
  IUserWriteRepositoryToken,
} from '@domain/ports/repositories';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
} from '@domain/exceptions';
import { UserStatus } from '@domain/entities';
import { UserRolePolicy } from '@domain/policies';

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject(IUserReadRepositoryToken)
    private readonly userReadRepository: IUserReadRepository,
    @Inject(IUserWriteRepositoryToken)
    private readonly userWriteRepository: IUserWriteRepository,
  ) {}

  async execute(input: DeleteUserDto): Promise<void> {
    const { userId, actorRole, actorSystemRole } = input;

    const { data: user } = await this.userReadRepository.findById(userId);

    if (!user) {
      throw EntityNotFoundException.create(EntityNotFoundExceptionCode.USER, {
        userId,
      });
    }

    UserRolePolicy.ensureHasHigherPrivileges(
      actorSystemRole ?? actorRole,
      user.systemRole,
    );

    if (user.status === UserStatus.DELETED) {
      return;
    }

    user.markAsDeleted();

    await this.userWriteRepository.update(user);
  }
}
