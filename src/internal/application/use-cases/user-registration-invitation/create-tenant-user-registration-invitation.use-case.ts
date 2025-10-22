import { Inject, Injectable } from '@nestjs/common';

import {
  ITenantUserReadRepository,
  ITenantUserReadRepositoryToken,
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
  CreateTenantUserRegistrationInvitationDto,
  UserRegistrationInvitationDto,
} from '@application/dto';
import { UserRegistrationInvitationMapper } from '@application/mappers';
import { UserRegistrationInvitationTokenService } from '@application/services';
import { UserRegistrationInvitationNotifierService } from '@application/services/notification';
import { User } from '@domain/entities';

@Injectable()
export class CreateTenantUserRegistrationInvitationUseCase {
  constructor(
    @Inject(IUserReadRepositoryToken)
    private readonly userReadRepository: IUserReadRepository,
    @Inject(IUserRegistrationInvitationReadRepositoryToken)
    private readonly invitationReadRepository: IUserRegistrationInvitationReadRepository,
    @Inject(IUserRegistrationInvitationWriteRepositoryToken)
    private readonly invitationWriteRepository: IUserRegistrationInvitationWriteRepository,
    @Inject(ITenantUserReadRepositoryToken)
    private readonly tenantUserReadRepository: ITenantUserReadRepository,
    private readonly notifier: UserRegistrationInvitationNotifierService,
  ) {}

  async execute(
    input: CreateTenantUserRegistrationInvitationDto,
  ): Promise<UserRegistrationInvitationDto> {
    await this.ensureInvitationDoesNotExist(input.email, input.tenantId);

    const existingUser = await this.findExistingUser(input.email);

    if (existingUser) {
      await this.ensureTenantMembershipDoesNotExist(
        existingUser.id!,
        input.tenantId,
      );
    }

    const { token, tokenHash } =
      UserRegistrationInvitationTokenService.generate();

    const invitationType = existingUser
      ? UserRegistrationInvitationType.EXISTING_USER_TENANT_LINK
      : UserRegistrationInvitationType.NEW_USER_REGISTRATION;

    const { data } = await this.invitationWriteRepository.create({
      scope: UserRegistrationInvitationScope.TENANT,
      type: invitationType,
      status: UserRegistrationInvitationStatus.PENDING,
      email: input.email,
      role: input.role,
      tenantId: input.tenantId,
      invitedByUserId: input.invitedByUserId,
      existingUserId: existingUser?.id ?? null,
      tokenHash,
      userData: input.userData ?? null,
    });

    await this.notifier.sendInvitation({
      email: input.email,
      token,
      invitationUrl:
        UserRegistrationInvitationTokenService.buildInvitationUrl(token),
      scope: UserRegistrationInvitationScope.TENANT,
      role: input.role,
      tenantId: input.tenantId,
      type: invitationType,
      existingUserId: existingUser?.id ?? null,
      userData: input.userData ?? null,
    });

    const dto = UserRegistrationInvitationMapper.toDto(data);

    return dto;
  }

  private async findExistingUser(email: string): Promise<User | null> {
    const { data } = await this.userReadRepository.findByEmail(email);
    return data ?? null;
  }

  private async ensureInvitationDoesNotExist(
    email: string,
    tenantId: string,
  ): Promise<void> {
    const { data } = await this.invitationReadRepository.findActiveByEmail(
      email,
      UserRegistrationInvitationScope.TENANT,
      tenantId,
    );

    if (data) {
      throw EntityAlreadyExistsException.create(
        EntityAlreadyExistsExceptionCode.USER_REGISTRATION_INVITATION_EMAIL,
        { email, scope: UserRegistrationInvitationScope.TENANT, tenantId },
      );
    }
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
