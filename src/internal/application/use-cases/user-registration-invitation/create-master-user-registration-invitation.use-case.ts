import { Inject, Injectable } from '@nestjs/common';

import {
  IUserReadRepository,
  IUserReadRepositoryToken,
  IUserRegistrationInvitationReadRepository,
  IUserRegistrationInvitationReadRepositoryToken,
  IUserRegistrationInvitationWriteRepository,
  IUserRegistrationInvitationWriteRepositoryToken,
  UserRegistrationInvitationScope,
  UserRegistrationInvitationStatus,
  UserRegistrationInvitationType,
} from '@domain/ports/repositories';
import {
  EntityAlreadyExistsException,
  EntityAlreadyExistsExceptionCode,
} from '@domain/exceptions';
import {
  CreateMasterUserRegistrationInvitationDto,
  UserRegistrationInvitationDto,
} from '@application/dto';
import { UserRegistrationInvitationMapper } from '@application/mappers';
import { UserRegistrationInvitationNotifierService } from '@application/services/notification';
import { UserRegistrationInvitationTokenService } from '@application/services';

@Injectable()
export class CreateMasterUserRegistrationInvitationUseCase {
  constructor(
    @Inject(IUserReadRepositoryToken)
    private readonly userReadRepository: IUserReadRepository,
    @Inject(IUserRegistrationInvitationReadRepositoryToken)
    private readonly invitationReadRepository: IUserRegistrationInvitationReadRepository,
    @Inject(IUserRegistrationInvitationWriteRepositoryToken)
    private readonly invitationWriteRepository: IUserRegistrationInvitationWriteRepository,
    private readonly notifier: UserRegistrationInvitationNotifierService,
  ) {}

  async execute(
    input: CreateMasterUserRegistrationInvitationDto,
  ): Promise<UserRegistrationInvitationDto> {
    await this.ensureUserDoesNotExist(input.email);
    await this.ensureInvitationDoesNotExist(input.email);

    const { token, tokenHash } =
      UserRegistrationInvitationTokenService.generate();

    const { data } = await this.invitationWriteRepository.create({
      scope: UserRegistrationInvitationScope.MASTER,
      type: UserRegistrationInvitationType.NEW_USER_REGISTRATION,
      status: UserRegistrationInvitationStatus.PENDING,
      email: input.email,
      role: input.role,
      invitedByUserId: input.invitedByUserId,
      existingUserId: null,
      tokenHash,
      userData: input.userData ?? null,
    });

    await this.notifier.sendInvitation({
      email: input.email,
      token,
      invitationUrl:
        UserRegistrationInvitationTokenService.buildInvitationUrl(token),
      scope: UserRegistrationInvitationScope.MASTER,
      role: input.role,
      type: UserRegistrationInvitationType.NEW_USER_REGISTRATION,
      tenantId: null,
      existingUserId: null,
      userData: input.userData ?? null,
    });

    const dto = UserRegistrationInvitationMapper.toDto(data);

    return dto;
  }

  private async ensureUserDoesNotExist(email: string): Promise<void> {
    const { data } = await this.userReadRepository.findByEmail(email);

    if (data) {
      throw EntityAlreadyExistsException.create(
        EntityAlreadyExistsExceptionCode.USER_EMAIL,
        { email },
      );
    }
  }

  private async ensureInvitationDoesNotExist(email: string): Promise<void> {
    const { data } = await this.invitationReadRepository.findActiveByEmail(
      email,
      UserRegistrationInvitationScope.MASTER,
    );

    if (data) {
      throw EntityAlreadyExistsException.create(
        EntityAlreadyExistsExceptionCode.USER_REGISTRATION_INVITATION_EMAIL,
        { email, scope: UserRegistrationInvitationScope.MASTER },
      );
    }
  }
}
