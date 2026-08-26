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
  CreateApplicationUserRegistrationInvitationDto,
  UserRegistrationInvitationDto,
} from '@application/dto';
import { UserRegistrationInvitationMapper } from '@application/mappers';
import {
  AuthorizationService,
  UserCustomerRelationshipValidationService,
  UserRegistrationInvitationTokenService,
} from '@application/services';
import { UserRegistrationInvitationNotifierService } from '@application/services/notification';
import { SystemRole, User } from '@domain/entities';

@Injectable()
export class CreateApplicationUserRegistrationInvitationUseCase {
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
    private readonly relationshipValidationService: UserCustomerRelationshipValidationService,
  ) {}

  async execute(
    input: CreateApplicationUserRegistrationInvitationDto,
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

    await this.ensureInvitationDoesNotExist(input.email);

    const customerIds =
      await this.relationshipValidationService.validateCustomerIds(
        input.customerIds,
        input.systemRole,
      );

    const existingUser = await this.findExistingUser(input.email);

    if (existingUser) {
      throw EntityAlreadyExistsException.create(
        EntityAlreadyExistsExceptionCode.USER_EMAIL,
        { email: input.email },
      );
    }

    const { token, tokenHash } = this.tokenService.generate();

    const invitationType = UserRegistrationInvitationType.NEW_USER_REGISTRATION;

    const { data } = await this.invitationWriteRepository.create({
      scope: UserRegistrationInvitationScope.APPLICATION,
      type: invitationType,
      status: UserRegistrationInvitationStatus.PENDING,
      email: input.email,
      systemRole: input.systemRole,
      roleId: input.roleId,
      invitedByUserId: input.invitedByUserId,
      tokenHash,
      userData: input.userData ?? null,
      customerIds,
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
      scope: UserRegistrationInvitationScope.APPLICATION,
      userData: input.userData ?? null,
    });

    const { data: acceptedInvitation } = data
      ? await this.invitationWriteRepository.markInvitationEmailAccepted({
          invitationId: data.invitationId,
          tokenHash,
        })
      : { data: null };

    const dto = UserRegistrationInvitationMapper.toDto(
      acceptedInvitation ?? data,
    );

    return dto!;
  }

  private async findExistingUser(email: string): Promise<User | null> {
    const { data } = await this.userReadRepository.findByEmail(email);
    return data ?? null;
  }

  private async ensureInvitationDoesNotExist(email: string): Promise<void> {
    const { data } = await this.invitationReadRepository.findActiveByEmail(
      email,
      UserRegistrationInvitationScope.APPLICATION,
    );

    if (data) {
      throw EntityAlreadyExistsException.create(
        EntityAlreadyExistsExceptionCode.USER_REGISTRATION_INVITATION_EMAIL,
        { email, scope: UserRegistrationInvitationScope.APPLICATION },
      );
    }
  }
}
