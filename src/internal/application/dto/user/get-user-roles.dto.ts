import { SystemRole, UserRole } from '@domain/entities';

export interface GetUserRolesDto {
  actorSystemRole: SystemRole;
}

export interface UserRoleViewDto {
  role: UserRole;
}

export interface GetUserRolesResultDto {
  roles: UserRoleViewDto[];
}
