import {
  CreateUserRegistrationInvitationRecord,
  UserRegistrationInvitationDecision,
  UserRegistrationInvitationRecord,
  UserRegistrationInvitationStatus,
} from './user-registration-invitation.types';

export interface IUserRegistrationInvitationWriteRepository {
  create(
    record: CreateUserRegistrationInvitationRecord,
  ): Promise<{ data: UserRegistrationInvitationRecord | null }>;

  markAsConsumed(
    invitationId: string,
    consumedAt: Date,
  ): Promise<{ data: UserRegistrationInvitationRecord | null }>;

  updateStatus(
    invitationId: string,
    status: UserRegistrationInvitationStatus,
    options?: {
      respondedAt?: Date;
      decision?: UserRegistrationInvitationDecision | null;
    },
  ): Promise<{ data: UserRegistrationInvitationRecord | null }>;
}

export const IUserRegistrationInvitationWriteRepositoryToken = Symbol(
  'IUserRegistrationInvitationWriteRepository',
);
