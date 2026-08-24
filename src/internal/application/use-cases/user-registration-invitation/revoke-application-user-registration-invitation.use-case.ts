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
  RevokeApplicationUserRegistrationInvitationDto,
} from '@application/dto';
import { UserRegistrationInvitationMapper } from '@application/mappers';

@Injectable()
export class RevokeApplicationUserRegistrationInvitationUseCase {
  constructor(
    @Inject(IUserRegistrationInvitationReadRepositoryToken)
    private readonly invitationReadRepository: IUserRegistrationInvitationReadRepository,
    @Inject(IUserRegistrationInvitationWriteRepositoryToken)
    private readonly invitationWriteRepository: IUserRegistrationInvitationWriteRepository,
  ) {}

  async execute(
    input: RevokeApplicationUserRegistrationInvitationDto,
  ): Promise<ApplicationUserRegistrationInvitationDto> {
    const invitation = await this.findPendingInvitation(input.invitationId);
    const { data: revokedInvitation } =
      await this.invitationWriteRepository.revokePendingApplicationInvitation({
        invitationId: invitation.invitationId,
        revokedAt: new Date(),
        revokedByUserId: input.revokedByUserId,
      });

    if (!revokedInvitation) {
      throw UserRegistrationInvitationException.concurrentModification();
    }

    const dto =
      UserRegistrationInvitationMapper.toApplicationDto(revokedInvitation);

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
