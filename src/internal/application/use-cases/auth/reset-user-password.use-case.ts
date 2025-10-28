import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import {
  IUserPasswordResetTokenReadRepository,
  IUserPasswordResetTokenReadRepositoryToken,
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
  InvalidValueException,
  InvalidValueExceptionCode,
} from '@domain/exceptions';
import { ResetUserPasswordDto } from '@application/dto';
import { UserPasswordResetTokenService } from '@application/services';
import { UserPasswordPolicy } from '@domain/policies';
import { UserStatus } from '@domain/entities';

@Injectable()
export class ResetUserPasswordUseCase {
  constructor(
    @Inject(IUserPasswordResetTokenReadRepositoryToken)
    private readonly passwordResetReadRepository: IUserPasswordResetTokenReadRepository,
    @Inject(IUserPasswordResetTokenWriteRepositoryToken)
    private readonly passwordResetWriteRepository: IUserPasswordResetTokenWriteRepository,
    @Inject(IUserReadRepositoryToken)
    private readonly userReadRepository: IUserReadRepository,
    @Inject(IUserWriteRepositoryToken)
    private readonly userWriteRepository: IUserWriteRepository,
    private readonly tokenService: UserPasswordResetTokenService,
  ) {}

  async execute(input: ResetUserPasswordDto): Promise<void> {
    const tokenHash = this.tokenService.hash(input.token);

    const { data: storedToken } =
      await this.passwordResetReadRepository.findByTokenHash(tokenHash);

    if (!storedToken) {
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.USER_PASSWORD_RESET_TOKEN,
        {},
      );
    }

    if (storedToken.consumedAt) {
      throw InvalidValueException.create(
        InvalidValueExceptionCode.USER_PASSWORD_RESET_TOKEN,
        { reason: 'Token already consumed' },
      );
    }

    if (storedToken.expiresAt.getTime() < Date.now()) {
      throw InvalidValueException.create(
        InvalidValueExceptionCode.USER_PASSWORD_RESET_TOKEN,
        { reason: 'Token expired' },
      );
    }

    const { data: user } = await this.userReadRepository.findById(
      storedToken.userId,
    );

    if (!user) {
      throw EntityNotFoundException.create(EntityNotFoundExceptionCode.USER, {
        userId: storedToken.userId,
      });
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw InvalidValueException.create(
        InvalidValueExceptionCode.USER_PASSWORD_RESET_TOKEN,
        { reason: 'User is not active' },
      );
    }

    UserPasswordPolicy.ensureSecure(input.password);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(input.password, salt);

    user.updatePassword(hashedPassword);

    await this.userWriteRepository.update(user);

    const consumedAt = new Date();

    await this.passwordResetWriteRepository.markAsConsumed(
      storedToken.passwordResetTokenId,
      consumedAt,
    );

    await this.passwordResetWriteRepository.invalidateAllForUser(user.id);
  }
}
