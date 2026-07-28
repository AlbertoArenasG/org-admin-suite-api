import { RoleScope, SystemRole } from '@domain/entities';

export interface GetUserRolesDto {
  actorSystemRole: SystemRole;
}

export interface UserRoleViewDto {
  roleId: string;
  code: string;
  name: string;
  scope: RoleScope;
  isSystem: boolean;
  isDefault: boolean;
}

export interface GetUserRolesResultDto {
  roles: UserRoleViewDto[];
}
