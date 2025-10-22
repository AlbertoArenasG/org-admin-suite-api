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
  CreateApplicationUserRegistrationInvitationDto,
  UserRegistrationInvitationDto,
} from '@application/dto';
import { UserRegistrationInvitationMapper } from '@application/mappers';
import { UserRegistrationInvitationTokenService } from '@application/services';
import { UserRegistrationInvitationNotifierService } from '@application/services/notification';
import { User, UserRole } from '@domain/entities';
import { UserRolePolicy } from '@domain/policies';

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
  ) {}

  async execute(
    input: CreateApplicationUserRegistrationInvitationDto,
    actorRole: UserRole,
  ): Promise<UserRegistrationInvitationDto> {
    UserRolePolicy.ensureCanManageRole(actorRole, input.role);

    await this.ensureInvitationDoesNotExist(input.email);

    const existingUser = await this.findExistingUser(input.email);

    if (existingUser) {
      throw EntityAlreadyExistsException.create(
        EntityAlreadyExistsExceptionCode.USER_EMAIL,
        { email: input.email },
      );
    }

    const { token, tokenHash } =
      UserRegistrationInvitationTokenService.generate();

    const invitationType = UserRegistrationInvitationType.NEW_USER_REGISTRATION;

    const { data } = await this.invitationWriteRepository.create({
      scope: UserRegistrationInvitationScope.APPLICATION,
      type: invitationType,
      status: UserRegistrationInvitationStatus.PENDING,
      email: input.email,
      role: input.role,
      invitedByUserId: input.invitedByUserId,
      tokenHash,
      userData: input.userData ?? null,
    });

    await this.notifier.sendInvitation({
      email: input.email,
      token,
      invitationUrl:
        UserRegistrationInvitationTokenService.buildInvitationUrl(token),
      scope: UserRegistrationInvitationScope.APPLICATION,
      role: input.role,
      userData: input.userData ?? null,
    });

    const dto = UserRegistrationInvitationMapper.toDto(data);

    return dto;
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
