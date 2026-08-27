import { CustomerStatus, SystemRole } from '@domain/entities';
import {
  UserRegistrationInvitationScope,
  UserRegistrationInvitationEmailDelivery,
  UserRegistrationInvitationStatus,
  UserRegistrationInvitationType,
  UserRegistrationInvitationUserData,
} from '@domain/ports/repositories';

export interface BaseCreateUserRegistrationInvitationDto {
  email: string;
  invitedByUserId: string;
  isInternalStaff?: boolean;
  userData?: UserRegistrationInvitationUserData | null;
}

export interface CreateApplicationUserRegistrationInvitationDto
  extends BaseCreateUserRegistrationInvitationDto {
  scope: UserRegistrationInvitationScope.APPLICATION;
  systemRole: SystemRole;
  roleId: string | null;
  isInternalStaff: boolean;
  customerIds: string[];
}

export interface CreateMasterUserRegistrationInvitationDto
  extends BaseCreateUserRegistrationInvitationDto {
  scope: UserRegistrationInvitationScope.MASTER;
  systemRole: SystemRole;
  roleId: string | null;
  isInternalStaff?: boolean;
}

export type CreateUserRegistrationInvitationDto =
  | CreateApplicationUserRegistrationInvitationDto
  | CreateMasterUserRegistrationInvitationDto;

export interface UserRegistrationInvitationDto {
  invitationId: string;
  email: string;
  scope: UserRegistrationInvitationScope;
  type: UserRegistrationInvitationType;
  status: UserRegistrationInvitationStatus;
  systemRole: SystemRole;
  roleId: string | null;
  isInternalStaff: boolean;
  invitedByUserId: string;
  userData?: UserRegistrationInvitationUserData | null;
  consumedAt?: Date | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface ApplicationUserRegistrationInvitationDto {
  invitationId: string;
  email: string;
  status: UserRegistrationInvitationStatus;
  systemRole: SystemRole;
  roleId: string | null;
  isInternalStaff: boolean;
  roleName: string | null;
  userData?: UserRegistrationInvitationUserData | null;
  invitedByUserId: string;
  createdAt?: Date | null;
  consumedAt?: Date | null;
  revokedAt: Date | null;
  revokedByUserId: string | null;
  emailDelivery: UserRegistrationInvitationEmailDelivery;
  resendCount: number;
  customers?: ApplicationInvitationCustomerDto[];
}

export interface ApplicationInvitationCustomerDto {
  id: string;
  companyName: string;
  status: CustomerStatus;
}
