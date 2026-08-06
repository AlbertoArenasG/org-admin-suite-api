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
import { AuthorizationService } from '@application/services';

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject(IUserReadRepositoryToken)
    private readonly userReadRepository: IUserReadRepository,
    @Inject(IUserWriteRepositoryToken)
    private readonly userWriteRepository: IUserWriteRepository,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async execute(input: DeleteUserDto): Promise<void> {
    const { userId, actorSystemRole, actorUserId } = input;

    const { data: user } = await this.userReadRepository.findById(userId);

    if (!user) {
      throw EntityNotFoundException.create(EntityNotFoundExceptionCode.USER, {
        userId,
      });
    }

    this.authorizationService.ensureCanDeleteUser(
      actorSystemRole,
      user.systemRole,
      actorUserId === userId,
    );

    if (user.status === UserStatus.DELETED) {
      return;
    }

    user.markAsDeleted();

    await this.userWriteRepository.update(user);
  }
}
