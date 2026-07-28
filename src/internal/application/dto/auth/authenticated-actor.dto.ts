import { SystemRole } from '@domain/entities';

export interface AuthenticatedUserContextDto {
  userId: string;
  systemRole: SystemRole;
  roleId: string | null;
  token: string;
}
