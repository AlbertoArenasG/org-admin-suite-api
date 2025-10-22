import { Inject, Injectable } from '@nestjs/common';

import {
  IUserRegistrationInvitationReadRepository,
  IUserRegistrationInvitationReadRepositoryToken,
} from '@domain/ports/repositories';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
  InvalidValueException,
  InvalidValueExceptionCode,
} from '@domain/exceptions';
import { UserRegistrationInvitationDto } from '@application/dto';
import { UserRegistrationInvitationMapper } from '@application/mappers';
import { UserRegistrationInvitationTokenService } from '@application/services';

@Injectable()
export class GetUserRegistrationInvitationUseCase {
  constructor(
    @Inject(IUserRegistrationInvitationReadRepositoryToken)
    private readonly invitationReadRepository: IUserRegistrationInvitationReadRepository,
  ) {}

  async execute(token: string): Promise<UserRegistrationInvitationDto> {
    const tokenHash = UserRegistrationInvitationTokenService.hash(token);

    const { data } =
      await this.invitationReadRepository.findByTokenHash(tokenHash);

    if (!data) {
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.UserRegistrationInvitation,
        {},
      );
    }

    if (data.consumedAt) {
      throw InvalidValueException.create(
        InvalidValueExceptionCode.USER_REGISTRATION_INVITATION_TOKEN,
        { reason: 'Invitation already consumed' },
      );
    }

    const dto = UserRegistrationInvitationMapper.toDto(data);

    return dto;
  }
}
