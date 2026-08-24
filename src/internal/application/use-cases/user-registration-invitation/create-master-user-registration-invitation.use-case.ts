import { Inject, Injectable } from '@nestjs/common';

import {
  IUserReadRepository,
  IUserReadRepositoryToken,
  IUserRegistrationInvitationReadRepository,
  IUserRegistrationInvitationReadRepositoryToken,
  IUserRegistrationInvitationWriteRepository,
  IUserRegistrationInvitationWriteRepositoryToken,
  UserRegistrationInvitationScope,
  UserRegistrationInvitationEmailDeliveryStatus,
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
import {
  AuthorizationService,
  UserRegistrationInvitationTokenService,
} from '@application/services';
import { SystemRole } from '@domain/entities';

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
    private readonly tokenService: UserRegistrationInvitationTokenService,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async execute(
    input: CreateMasterUserRegistrationInvitationDto,
    actorSystemRole: SystemRole,
  ): Promise<UserRegistrationInvitationDto> {
    await this.authorizationService.ensureCanCreateUser(
      {
        userId: input.invitedByUserId,
        systemRole: actorSystemRole,
        roleId: null,
      },
      {
        systemRole: input.systemRole,
        roleId: input.roleId,
      },
    );

    await this.ensureUserDoesNotExist(input.email);
    await this.ensureInvitationDoesNotExist(input.email);

    const { token, tokenHash } = this.tokenService.generate();

    const { data } = await this.invitationWriteRepository.create({
      scope: UserRegistrationInvitationScope.MASTER,
      type: UserRegistrationInvitationType.NEW_USER_REGISTRATION,
      status: UserRegistrationInvitationStatus.PENDING,
      email: input.email,
      systemRole: input.systemRole,
      roleId: input.roleId,
      invitedByUserId: input.invitedByUserId,
      tokenHash,
      userData: input.userData ?? null,
      emailDelivery: {
        lastAttemptAt: new Date(),
        lastAttemptStatus: UserRegistrationInvitationEmailDeliveryStatus.FAILED,
      },
      resendCount: 0,
      revokedAt: null,
      revokedByUserId: null,
    });

    await this.notifier.sendInvitation({
      email: input.email,
      token,
      invitationUrl: this.tokenService.buildInvitationUrl(token),
      scope: UserRegistrationInvitationScope.MASTER,
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
