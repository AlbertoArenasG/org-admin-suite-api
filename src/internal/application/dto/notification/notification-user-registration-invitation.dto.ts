import {
  UserRegistrationInvitationScope,
  UserRegistrationInvitationUserData,
} from '@domain/ports/repositories';

export interface UserRegistrationInvitationEmailDto {
  email: string;
  token: string;
  invitationUrl: string;
  scope: UserRegistrationInvitationScope;
  role: string;
  userData?: UserRegistrationInvitationUserData | null;
}
