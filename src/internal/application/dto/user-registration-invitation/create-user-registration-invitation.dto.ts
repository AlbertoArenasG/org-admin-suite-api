import { UserRole } from '@domain/entities';
import {
  UserRegistrationInvitationScope,
  UserRegistrationInvitationStatus,
  UserRegistrationInvitationType,
  UserRegistrationInvitationUserData,
} from '@domain/ports/repositories';

export interface BaseCreateUserRegistrationInvitationDto {
  email: string;
  invitedByUserId: string;
  userData?: UserRegistrationInvitationUserData | null;
}

export interface CreateApplicationUserRegistrationInvitationDto
  extends BaseCreateUserRegistrationInvitationDto {
  scope: UserRegistrationInvitationScope.APPLICATION;
  role: UserRole;
}

export interface CreateMasterUserRegistrationInvitationDto
  extends BaseCreateUserRegistrationInvitationDto {
  scope: UserRegistrationInvitationScope.MASTER;
  role: UserRole;
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
  role: string;
  invitedByUserId: string;
  userData?: UserRegistrationInvitationUserData | null;
  consumedAt?: Date | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}
