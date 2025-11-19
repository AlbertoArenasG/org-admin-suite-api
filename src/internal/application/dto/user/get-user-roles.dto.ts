import { UserRole } from '@domain/entities';

export interface GetUserRolesDto {
  actorRole: UserRole;
}

export interface UserRoleViewDto {
  role: UserRole;
}

export interface GetUserRolesResultDto {
  roles: UserRoleViewDto[];
}
