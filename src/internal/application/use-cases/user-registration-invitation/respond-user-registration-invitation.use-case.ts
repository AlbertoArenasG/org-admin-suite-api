import { Inject, Injectable } from '@nestjs/common';

import {
  ITenantUserReadRepository,
  ITenantUserReadRepositoryToken,
  ITenantUserWriteRepository,
  ITenantUserWriteRepositoryToken,
  IUserReadRepository,
  IUserReadRepositoryToken,
  IUserRegistrationInvitationReadRepository,
  IUserRegistrationInvitationReadRepositoryToken,
  IUserRegistrationInvitationWriteRepository,
  IUserRegistrationInvitationWriteRepositoryToken,
  UserRegistrationInvitationRecord,
  UserRegistrationInvitationScope,
  UserRegistrationInvitationStatus,
  UserRegistrationInvitationType,
} from '@domain/ports/repositories';
import {
  EntityAlreadyExistsException,
  EntityAlreadyExistsExceptionCode,
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
  InvalidValueException,
  InvalidValueExceptionCode,
} from '@domain/exceptions';
import { TenantUser, TenantUserRole, TenantUserStatus } from '@domain/entities';
import {
  RespondUserRegistrationInvitationDto,
  RespondUserRegistrationInvitationResultDto,
} from '@application/dto';
import { UserResultMapper } from '@application/mappers';
import { UserRegistrationInvitationTokenService } from '@application/services';

@Injectable()
export class RespondUserRegistrationInvitationUseCase {
  constructor(
    @Inject(IUserRegistrationInvitationReadRepositoryToken)
    private readonly invitationReadRepository: IUserRegistrationInvitationReadRepository,
    @Inject(IUserRegistrationInvitationWriteRepositoryToken)
    private readonly invitationWriteRepository: IUserRegistrationInvitationWriteRepository,
    @Inject(IUserReadRepositoryToken)
    private readonly userReadRepository: IUserReadRepository,
    @Inject(ITenantUserReadRepositoryToken)
    private readonly tenantUserReadRepository: ITenantUserReadRepository,
    @Inject(ITenantUserWriteRepositoryToken)
    private readonly tenantUserWriteRepository: ITenantUserWriteRepository,
  ) {}

  async execute(
    input: RespondUserRegistrationInvitationDto,
  ): Promise<RespondUserRegistrationInvitationResultDto> {
    const invitation = await this.findValidInvitation(input.token);

    if (
      invitation.type !==
      UserRegistrationInvitationType.EXISTING_USER_TENANT_LINK
    ) {
      throw InvalidValueException.create(
        InvalidValueExceptionCode.USER_REGISTRATION_INVITATION_TOKEN,
        { reason: 'Invitation is not for an existing user' },
      );
    }

    if (invitation.status !== UserRegistrationInvitationStatus.PENDING) {
      throw InvalidValueException.create(
        InvalidValueExceptionCode.USER_REGISTRATION_INVITATION_TOKEN,
        { reason: 'Invitation already responded' },
      );
    }

    if (!invitation.tenantId) {
      throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
        reason: 'Tenant id is required for tenant invitations',
      });
    }

    if (!invitation.existingUserId) {
      throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
        reason: 'Invitation missing existing user reference',
      });
    }

    if (input.decision === 'DECLINE') {
      await this.invitationWriteRepository.updateStatus(
        invitation.invitationId,
        UserRegistrationInvitationStatus.DECLINED,
        {
          respondedAt: new Date(),
          decision: 'DECLINED',
        },
      );

      return { status: 'DECLINED' };
    }

    const user = await this.findExistingUser(invitation.email);

    if (user.id !== invitation.existingUserId) {
      throw InvalidValueException.create(
        InvalidValueExceptionCode.USER_REGISTRATION_INVITATION_TOKEN,
        { reason: 'Invitation user mismatch' },
      );
    }

    await this.ensureTenantMembershipDoesNotExist(
      user.id!,
      invitation.tenantId,
    );

    const tenantUser = new TenantUser({
      tenantId: invitation.tenantId,
      userId: user.id!,
      role: invitation.role as TenantUserRole,
      status: TenantUserStatus.ACTIVE,
    });

    const { data: persistedTenantUser } =
      await this.tenantUserWriteRepository.create(tenantUser);

    persistedTenantUser.markAsCreated();

    await this.invitationWriteRepository.updateStatus(
      invitation.invitationId,
      UserRegistrationInvitationStatus.ACCEPTED,
      {
        respondedAt: new Date(),
        decision: 'ACCEPTED',
      },
    );

    const result = UserResultMapper.toCreateTenantUserResultDto(
      user,
      persistedTenantUser,
    );

    return {
      status: 'ACCEPTED',
      user: result,
    };
  }

  private async findValidInvitation(
    token: string,
  ): Promise<UserRegistrationInvitationRecord> {
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

    if (data.scope !== UserRegistrationInvitationScope.TENANT) {
      throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
        reason: 'Invitation is not associated with a tenant',
      });
    }

    return data;
  }

  private async findExistingUser(email: string) {
    const { data } = await this.userReadRepository.findByEmail(email);

    if (!data) {
      throw EntityNotFoundException.create(EntityNotFoundExceptionCode.User, {
        email,
      });
    }

    return data;
  }

  private async ensureTenantMembershipDoesNotExist(
    userId: string,
    tenantId: string,
  ): Promise<void> {
    const { data } =
      await this.tenantUserReadRepository.findManyByUserId(userId);

    const alreadyMember = data.some(
      (tenantUser) => tenantUser.tenantId === tenantId,
    );

    if (alreadyMember) {
      throw EntityAlreadyExistsException.create(
        EntityAlreadyExistsExceptionCode.TENANT_USER_EMAIL,
        { userId, tenantId },
      );
    }
  }
}
