export enum UserRegistrationInvitationScope {
  TENANT = 'TENANT',
  MASTER = 'MASTER',
}

export enum UserRegistrationInvitationType {
  NEW_USER_REGISTRATION = 'NEW_USER_REGISTRATION',
  EXISTING_USER_TENANT_LINK = 'EXISTING_USER_TENANT_LINK',
}

export enum UserRegistrationInvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  CONSUMED = 'CONSUMED',
}

export type UserRegistrationInvitationDecision = 'ACCEPTED' | 'DECLINED';

export interface UserRegistrationInvitationUserData {
  name?: string | null;
  lastname?: string | null;
  cellPhone?: {
    countryCode: string | null;
    number: string | null;
  } | null;
  [key: string]: unknown;
}

export interface CreateUserRegistrationInvitationRecord {
  scope: UserRegistrationInvitationScope;
  type: UserRegistrationInvitationType;
  status: UserRegistrationInvitationStatus;
  email: string;
  role: string;
  tenantId?: string | null;
  invitedByUserId: string;
  existingUserId?: string | null;
  tokenHash: string;
  userData?: UserRegistrationInvitationUserData | null;
}

export interface UserRegistrationInvitationRecord
  extends CreateUserRegistrationInvitationRecord {
  id: string;
  invitationId: string;
  consumedAt?: Date | null;
  respondedAt?: Date | null;
  responseDecision?: UserRegistrationInvitationDecision | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}
