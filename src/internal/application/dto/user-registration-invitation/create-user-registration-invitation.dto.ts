import { TenantUserRole, UserRole } from '@domain/entities';
import {
  UserRegistrationInvitationScope,
  UserRegistrationInvitationStatus,
  UserRegistrationInvitationType,
  UserRegistrationInvitationUserData,
  UserRegistrationInvitationDecision,
} from '@domain/ports/repositories';

export interface BaseCreateUserRegistrationInvitationDto {
  email: string;
  invitedByUserId: string;
  userData?: UserRegistrationInvitationUserData | null;
}

export interface CreateTenantUserRegistrationInvitationDto
  extends BaseCreateUserRegistrationInvitationDto {
  scope: UserRegistrationInvitationScope.TENANT;
  tenantId: string;
  role: TenantUserRole;
}

export interface CreateMasterUserRegistrationInvitationDto
  extends BaseCreateUserRegistrationInvitationDto {
  scope: UserRegistrationInvitationScope.MASTER;
  role: UserRole;
}

export type CreateUserRegistrationInvitationDto =
  | CreateTenantUserRegistrationInvitationDto
  | CreateMasterUserRegistrationInvitationDto;

export interface UserRegistrationInvitationDto {
  invitationId: string;
  email: string;
  scope: UserRegistrationInvitationScope;
  type: UserRegistrationInvitationType;
  status: UserRegistrationInvitationStatus;
  role: string;
  tenantId?: string | null;
  invitedByUserId: string;
  existingUserId?: string | null;
  userData?: UserRegistrationInvitationUserData | null;
  consumedAt?: Date | null;
  respondedAt?: Date | null;
  responseDecision?: UserRegistrationInvitationDecision | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}
