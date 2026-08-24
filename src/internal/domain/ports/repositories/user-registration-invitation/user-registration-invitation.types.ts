import { SystemRole } from '@domain/entities';

export enum UserRegistrationInvitationScope {
  APPLICATION = 'APPLICATION',
  MASTER = 'MASTER',
}

export enum UserRegistrationInvitationType {
  NEW_USER_REGISTRATION = 'NEW_USER_REGISTRATION',
}

export enum UserRegistrationInvitationStatus {
  PENDING = 'PENDING',
  CONSUMED = 'CONSUMED',
  REVOKED = 'REVOKED',
}

export enum UserRegistrationInvitationEmailDeliveryStatus {
  ACCEPTED = 'ACCEPTED',
  FAILED = 'FAILED',
}

export interface UserRegistrationInvitationEmailDelivery {
  lastAttemptAt: Date | null;
  lastAttemptStatus: UserRegistrationInvitationEmailDeliveryStatus | null;
}

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
  systemRole: SystemRole;
  roleId: string | null;
  invitedByUserId: string;
  tokenHash: string;
  userData?: UserRegistrationInvitationUserData | null;
  emailDelivery: UserRegistrationInvitationEmailDelivery;
  resendCount: number;
  revokedAt: Date | null;
  revokedByUserId: string | null;
}

export interface UserRegistrationInvitationRecord
  extends CreateUserRegistrationInvitationRecord {
  id: string;
  invitationId: string;
  consumedAt?: Date | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}
