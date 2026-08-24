import {
  UserRegistrationInvitationStatus,
  UserRegistrationInvitationSortDirection,
  UserRegistrationInvitationSortField,
} from '@domain/ports/repositories';
import { ApplicationUserRegistrationInvitationDto } from './create-user-registration-invitation.dto';

export interface GetApplicationUserRegistrationInvitationsDto {
  page: number;
  perPage: number;
  search?: string | null;
  status?: UserRegistrationInvitationStatus | null;
  sorts: Array<{
    field: UserRegistrationInvitationSortField;
    direction: UserRegistrationInvitationSortDirection;
  }>;
}

export interface GetApplicationUserRegistrationInvitationsResultDto {
  data: ApplicationUserRegistrationInvitationDto[];
  total: number;
}

export interface ResendApplicationUserRegistrationInvitationDto {
  invitationId: string;
}

export interface RevokeApplicationUserRegistrationInvitationDto {
  invitationId: string;
  revokedByUserId: string;
}
