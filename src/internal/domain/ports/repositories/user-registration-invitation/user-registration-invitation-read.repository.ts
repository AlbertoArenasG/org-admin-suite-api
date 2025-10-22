import {
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
}

export const IUserRegistrationInvitationReadRepositoryToken = Symbol(
  'IUserRegistrationInvitationReadRepository',
);
