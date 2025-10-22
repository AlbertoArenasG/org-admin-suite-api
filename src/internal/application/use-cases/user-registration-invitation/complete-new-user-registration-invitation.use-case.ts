import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import {
  IUserReadRepository,
  IUserReadRepositoryToken,
  IUserRegistrationInvitationReadRepository,
  IUserRegistrationInvitationReadRepositoryToken,
  IUserRegistrationInvitationWriteRepository,
  IUserRegistrationInvitationWriteRepositoryToken,
  IUserWriteRepository,
  IUserWriteRepositoryToken,
  UserRegistrationInvitationRecord,
  UserRegistrationInvitationScope,
  UserRegistrationInvitationStatus,
  UserRegistrationInvitationType,
  UserRegistrationInvitationUserData,
} from '@domain/ports/repositories';
import {
  EntityAlreadyExistsException,
  EntityAlreadyExistsExceptionCode,
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
  InvalidValueException,
  InvalidValueExceptionCode,
} from '@domain/exceptions';
import { User, UserRole, UserStatus } from '@domain/entities';
import { UserPasswordPolicy } from '@domain/policies';
import {
  CompleteNewUserRegistrationInvitationDto,
  CompleteNewUserRegistrationInvitationResultDto,
  CreateMasterUserResultDto,
  CreateUserResultDto,
} from '@application/dto';
import { UserResultMapper } from '@application/mappers';
import { UserRegistrationInvitationTokenService } from '@application/services';

@Injectable()
export class CompleteNewUserRegistrationInvitationUseCase {
  constructor(
    @Inject(IUserRegistrationInvitationReadRepositoryToken)
    private readonly invitationReadRepository: IUserRegistrationInvitationReadRepository,
    @Inject(IUserRegistrationInvitationWriteRepositoryToken)
    private readonly invitationWriteRepository: IUserRegistrationInvitationWriteRepository,
    @Inject(IUserReadRepositoryToken)
    private readonly userReadRepository: IUserReadRepository,
    @Inject(IUserWriteRepositoryToken)
    private readonly userWriteRepository: IUserWriteRepository,
  ) {}

  async execute(
    input: CompleteNewUserRegistrationInvitationDto,
  ): Promise<CompleteNewUserRegistrationInvitationResultDto> {
    const invitation = await this.findValidInvitation(input.token);

    if (
      invitation.type !== UserRegistrationInvitationType.NEW_USER_REGISTRATION
    ) {
      throw InvalidValueException.create(
        InvalidValueExceptionCode.USER_REGISTRATION_INVITATION_TOKEN,
        { reason: 'Invitation is not a new user registration' },
      );
    }

    if (invitation.status !== UserRegistrationInvitationStatus.PENDING) {
      throw InvalidValueException.create(
        InvalidValueExceptionCode.USER_REGISTRATION_INVITATION_TOKEN,
        { reason: 'Invitation already responded' },
      );
    }

    await this.ensureUserDoesNotExist(invitation.email);

    UserPasswordPolicy.ensureSecure(input.password);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(input.password, salt);

    const mergedUserData = this.mergeUserData(
      invitation.userData,
      input.userData,
    );

    if (!mergedUserData.name || !mergedUserData.lastname) {
      throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
        reason: 'Missing required user profile data',
      });
    }

    const user = new User({
      name: mergedUserData.name,
      lastname: mergedUserData.lastname,
      email: invitation.email,
      password: hashedPassword,
      role: invitation.role as UserRole,
      status: UserStatus.ACTIVE,
      cellPhone: {
        countryCode: mergedUserData.cellPhone?.countryCode ?? null,
        number: mergedUserData.cellPhone?.number ?? null,
      },
    });

    const { data: createdUser } = await this.userWriteRepository.create(user);

    createdUser.markAsCreated();

    const result =
      invitation.scope === UserRegistrationInvitationScope.MASTER
        ? this.completeMasterInvitation(createdUser)
        : this.completeApplicationInvitation(createdUser);

    await this.invitationWriteRepository.markAsConsumed(
      invitation.invitationId,
      new Date(),
    );

    return {
      scope: invitation.scope,
      user: result,
    } as CompleteNewUserRegistrationInvitationResultDto;
  }

  private async findValidInvitation(
    token: string,
  ): Promise<UserRegistrationInvitationRecord> {
    const tokenHash = UserRegistrationInvitationTokenService.hash(token);

    const { data } =
      await this.invitationReadRepository.findByTokenHash(tokenHash);

    if (!data) {
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.USER_REGISTRATION_INVITATION,
        {},
      );
    }

    if (data.consumedAt) {
      throw InvalidValueException.create(
        InvalidValueExceptionCode.USER_REGISTRATION_INVITATION_TOKEN,
        { reason: 'Invitation already consumed' },
      );
    }

    return data;
  }

  private mergeUserData(
    invitationData?: UserRegistrationInvitationUserData | null,
    overrideData?: UserRegistrationInvitationUserData | null,
  ): UserRegistrationInvitationUserData {
    const merged: UserRegistrationInvitationUserData = {
      ...(invitationData ?? {}),
      ...(overrideData ?? {}),
    };

    if (overrideData?.cellPhone) {
      merged.cellPhone = overrideData.cellPhone;
    } else if (invitationData?.cellPhone && !merged.cellPhone) {
      merged.cellPhone = invitationData.cellPhone;
    }

    return merged;
  }

  private completeMasterInvitation(
    createdUser: User,
  ): CreateMasterUserResultDto {
    return UserResultMapper.toCreateMasterUserResultDto(createdUser);
  }

  private completeApplicationInvitation(
    createdUser: User,
  ): CreateUserResultDto {
    return UserResultMapper.toCreateUserResultDto(createdUser);
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
}
