import {
  CreateUserRegistrationInvitationRecord,
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
}

export const IUserRegistrationInvitationWriteRepositoryToken = Symbol(
  'IUserRegistrationInvitationWriteRepository',
);
