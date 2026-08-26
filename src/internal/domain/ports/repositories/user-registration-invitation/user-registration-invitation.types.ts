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

export type UserRegistrationInvitationSortField = 'status' | 'created_at';
export type UserRegistrationInvitationSortDirection = 'asc' | 'desc';

export interface FindApplicationUserRegistrationInvitationsParams {
  page: number;
  perPage: number;
  search?: string | null;
  status?: UserRegistrationInvitationStatus | null;
  sorts: Array<{
    field: UserRegistrationInvitationSortField;
    direction: UserRegistrationInvitationSortDirection;
  }>;
}

export interface FindApplicationUserRegistrationInvitationsResult {
  data: UserRegistrationInvitationRecord[];
  total: number;
}

export interface RotatePendingUserRegistrationInvitationTokenInput {
  invitationId: string;
  expectedTokenHash: string;
  tokenHash: string;
  attemptedAt: Date;
}

export interface MarkUserRegistrationInvitationEmailAcceptedInput {
  invitationId: string;
  tokenHash: string;
}

export interface RevokePendingApplicationUserRegistrationInvitationInput {
  invitationId: string;
  revokedAt: Date;
  revokedByUserId: string;
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
  customerIds: string[];
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
