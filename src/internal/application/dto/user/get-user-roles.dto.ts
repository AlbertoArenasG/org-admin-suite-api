import { SystemRole, UserRole } from '@domain/entities';

export interface GetUserRolesDto {
  actorRole: UserRole;
  actorSystemRole?: SystemRole;
}

export interface UserRoleViewDto {
  role: UserRole;
}

export interface GetUserRolesResultDto {
  roles: UserRoleViewDto[];
}
