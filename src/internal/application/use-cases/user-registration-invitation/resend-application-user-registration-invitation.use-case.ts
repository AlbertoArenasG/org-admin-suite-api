import { Inject, Injectable } from '@nestjs/common';

import {
  IUserRegistrationInvitationReadRepository,
  IUserRegistrationInvitationReadRepositoryToken,
  IUserRegistrationInvitationWriteRepository,
  IUserRegistrationInvitationWriteRepositoryToken,
  UserRegistrationInvitationStatus,
} from '@domain/ports/repositories';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
  UserRegistrationInvitationException,
} from '@domain/exceptions';
import {
  ApplicationUserRegistrationInvitationDto,
  ResendApplicationUserRegistrationInvitationDto,
} from '@application/dto';
import { UserRegistrationInvitationMapper } from '@application/mappers';
import { UserRegistrationInvitationNotifierService } from '@application/services/notification';
import { UserRegistrationInvitationTokenService } from '@application/services';

@Injectable()
export class ResendApplicationUserRegistrationInvitationUseCase {
  constructor(
    @Inject(IUserRegistrationInvitationReadRepositoryToken)
    private readonly invitationReadRepository: IUserRegistrationInvitationReadRepository,
    @Inject(IUserRegistrationInvitationWriteRepositoryToken)
    private readonly invitationWriteRepository: IUserRegistrationInvitationWriteRepository,
    private readonly notifier: UserRegistrationInvitationNotifierService,
    private readonly tokenService: UserRegistrationInvitationTokenService,
  ) {}

  async execute(
    input: ResendApplicationUserRegistrationInvitationDto,
  ): Promise<ApplicationUserRegistrationInvitationDto> {
    const invitation = await this.findPendingInvitation(input.invitationId);
    const { token, tokenHash } = this.tokenService.generate();
    const attemptedAt = new Date();
    const { data: rotatedInvitation } =
      await this.invitationWriteRepository.rotatePendingInvitationToken({
        invitationId: invitation.invitationId,
        expectedTokenHash: invitation.tokenHash,
        tokenHash,
        attemptedAt,
      });

    if (!rotatedInvitation) {
      throw UserRegistrationInvitationException.concurrentModification();
    }

    await this.notifier.sendInvitation({
      email: rotatedInvitation.email,
      token,
      invitationUrl: this.tokenService.buildInvitationUrl(token),
      scope: rotatedInvitation.scope,
      userData: rotatedInvitation.userData ?? null,
    });

    const { data: acceptedInvitation } =
      await this.invitationWriteRepository.markInvitationEmailAccepted({
        invitationId: rotatedInvitation.invitationId,
        tokenHash,
      });

    const dto = UserRegistrationInvitationMapper.toApplicationDto(
      acceptedInvitation ?? rotatedInvitation,
    );

    if (!dto) {
      throw UserRegistrationInvitationException.concurrentModification();
    }

    return dto;
  }

  private async findPendingInvitation(invitationId: string) {
    const { data } =
      await this.invitationReadRepository.findApplicationInvitationById(
        invitationId,
      );

    if (!data) {
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.USER_REGISTRATION_INVITATION,
        {},
      );
    }

    if (
      data.status !== UserRegistrationInvitationStatus.PENDING ||
      data.consumedAt
    ) {
      throw UserRegistrationInvitationException.notPending(data.status);
    }

    return data;
  }
}
