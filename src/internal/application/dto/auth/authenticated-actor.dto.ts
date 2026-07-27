import { SystemRole, UserRole } from '@domain/entities';

export interface AuthenticatedUserContextDto {
  userId: string;
  role: UserRole;
  systemRole: SystemRole;
  roleId: string | null;
  isMaster: boolean;
  token: string;
}
