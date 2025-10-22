import {
  UserRegistrationInvitationScope,
  UserRegistrationInvitationType,
  UserRegistrationInvitationUserData,
} from '@domain/ports/repositories';

export interface UserRegistrationInvitationEmailDto {
  email: string;
  token: string;
  invitationUrl: string;
  scope: UserRegistrationInvitationScope;
  type: UserRegistrationInvitationType;
  role: string;
  tenantId?: string | null;
  existingUserId?: string | null;
  userData?: UserRegistrationInvitationUserData | null;
}
