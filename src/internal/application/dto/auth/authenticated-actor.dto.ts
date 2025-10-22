import { UserRole } from '@domain/entities';

export interface AuthenticatedUserContextDto {
  userId: string;
  role: UserRole;
  isMaster: boolean;
  token: string;
}
