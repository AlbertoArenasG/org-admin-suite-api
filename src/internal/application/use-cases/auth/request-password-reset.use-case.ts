import { Inject, Injectable } from '@nestjs/common';

import {
  IUserPasswordResetTokenWriteRepository,
  IUserPasswordResetTokenWriteRepositoryToken,
  IUserReadRepository,
  IUserReadRepositoryToken,
} from '@domain/ports/repositories';
import { RequestPasswordResetDto } from '@application/dto';
import { UserPasswordResetTokenService } from '@application/services';
import { UserPasswordResetNotifierService } from '@application/services/notification';
import { UserStatus } from '@domain/entities';

@Injectable()
export class RequestPasswordResetUseCase {
  constructor(
    @Inject(IUserReadRepositoryToken)
    private readonly userReadRepository: IUserReadRepository,
    @Inject(IUserPasswordResetTokenWriteRepositoryToken)
    private readonly passwordResetWriteRepository: IUserPasswordResetTokenWriteRepository,
    private readonly tokenService: UserPasswordResetTokenService,
    private readonly notifier: UserPasswordResetNotifierService,
  ) {}

  async execute(input: RequestPasswordResetDto): Promise<void> {
    const { data: user } = await this.userReadRepository.findByEmail(
      input.email,
    );

    if (!user || user.status !== UserStatus.ACTIVE) {
      return;
    }

    await this.passwordResetWriteRepository.invalidateAllForUser(user.id);

    const generatedToken = this.tokenService.generate();

    await this.passwordResetWriteRepository.create({
      userId: user.id,
      email: user.email,
      tokenHash: generatedToken.tokenHash,
      requestedAt: generatedToken.requestedAt,
      expiresAt: generatedToken.expiresAt,
    });

    await this.notifier.sendPasswordResetEmail({
      email: user.email,
      fullName: user.fullName,
      resetUrl: this.tokenService.buildResetUrl(generatedToken.token),
    });
  }
}
