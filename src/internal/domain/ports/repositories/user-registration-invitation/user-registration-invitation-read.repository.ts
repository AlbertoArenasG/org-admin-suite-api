import {
  FindApplicationUserRegistrationInvitationsParams,
  FindApplicationUserRegistrationInvitationsResult,
  UserRegistrationInvitationRecord,
  UserRegistrationInvitationScope,
} from './user-registration-invitation.types';

export interface IUserRegistrationInvitationReadRepository {
  findActiveByEmail(
    email: string,
    scope: UserRegistrationInvitationScope,
  ): Promise<{ data: UserRegistrationInvitationRecord | null }>;

  findByTokenHash(
    tokenHash: string,
  ): Promise<{ data: UserRegistrationInvitationRecord | null }>;

  findAllApplicationInvitations(
    params: FindApplicationUserRegistrationInvitationsParams,
  ): Promise<FindApplicationUserRegistrationInvitationsResult>;

  findApplicationInvitationById(
    invitationId: string,
  ): Promise<{ data: UserRegistrationInvitationRecord | null }>;
}

export const IUserRegistrationInvitationReadRepositoryToken = Symbol(
  'IUserRegistrationInvitationReadRepository',
);
