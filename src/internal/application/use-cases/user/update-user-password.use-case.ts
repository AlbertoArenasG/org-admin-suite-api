import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import {
  IUserPasswordResetTokenWriteRepository,
  IUserPasswordResetTokenWriteRepositoryToken,
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
import { UserPasswordPolicy } from '@domain/policies';
import { UpdateUserPasswordDto } from '@application/dto';
import { AuthorizationService } from '@application/services';

@Injectable()
export class UpdateUserPasswordUseCase {
  constructor(
    @Inject(IUserReadRepositoryToken)
    private readonly userReadRepository: IUserReadRepository,
    @Inject(IUserWriteRepositoryToken)
    private readonly userWriteRepository: IUserWriteRepository,
    @Inject(IUserPasswordResetTokenWriteRepositoryToken)
    private readonly passwordResetWriteRepository: IUserPasswordResetTokenWriteRepository,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async execute(input: UpdateUserPasswordDto): Promise<void> {
    const { data: user } = await this.userReadRepository.findById(input.userId);

    if (!user || user.status === UserStatus.DELETED) {
      throw EntityNotFoundException.create(EntityNotFoundExceptionCode.USER, {
        userId: input.userId,
      });
    }

    if (input.actorUserId !== input.userId) {
      this.authorizationService.ensureCanManageTargetSystemRole(
        input.actorSystemRole,
        user.systemRole,
      );
    }

    UserPasswordPolicy.ensureSecure(input.password);

    const salt = await bcrypt.genSalt(10);
    user.updatePassword(await bcrypt.hash(input.password, salt));

    const { data: updated } = await this.userWriteRepository.update(user);

    if (!updated) {
      throw EntityNotFoundException.create(EntityNotFoundExceptionCode.USER, {
        userId: input.userId,
      });
    }

    await this.passwordResetWriteRepository.invalidateAllForUser(user.id);
  }
}
