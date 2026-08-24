import {
  CreateUserRegistrationInvitationRecord,
  MarkUserRegistrationInvitationEmailAcceptedInput,
  RevokePendingApplicationUserRegistrationInvitationInput,
  RotatePendingUserRegistrationInvitationTokenInput,
  UserRegistrationInvitationRecord,
} from './user-registration-invitation.types';

export interface IUserRegistrationInvitationWriteRepository {
  create(
    record: CreateUserRegistrationInvitationRecord,
  ): Promise<{ data: UserRegistrationInvitationRecord | null }>;

  markAsConsumed(
    invitationId: string,
    consumedAt: Date,
  ): Promise<{ data: UserRegistrationInvitationRecord | null }>;

  rotatePendingInvitationToken(
    input: RotatePendingUserRegistrationInvitationTokenInput,
  ): Promise<{ data: UserRegistrationInvitationRecord | null }>;

  markInvitationEmailAccepted(
    input: MarkUserRegistrationInvitationEmailAcceptedInput,
  ): Promise<{ data: UserRegistrationInvitationRecord | null }>;

  revokePendingApplicationInvitation(
    input: RevokePendingApplicationUserRegistrationInvitationInput,
  ): Promise<{ data: UserRegistrationInvitationRecord | null }>;
}

export const IUserRegistrationInvitationWriteRepositoryToken = Symbol(
  'IUserRegistrationInvitationWriteRepository',
);
