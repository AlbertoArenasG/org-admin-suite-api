import { RoleScope, RoleStatus, SystemRole } from '@domain/entities';

export interface ResolvedPermissionDto {
  module: string;
  moduleNameKey: string;
  operation: string;
  operationNameKey: string;
}

export interface ResolvedPermissionModuleDto {
  code: string;
  nameKey: string;
}

export interface AuthenticatedRoleMetadataDto {
  id: string;
  code: string;
  name: string;
  scope: RoleScope;
  isSystem: boolean;
  isDefault: boolean;
  isImmutable: boolean;
  status: RoleStatus;
}

export interface GetMyPermissionsDto {
  userId: string;
  systemRole: SystemRole;
  roleId: string | null;
}

export interface GetMyPermissionsResultDto {
  systemRole: SystemRole;
  role: AuthenticatedRoleMetadataDto | null;
  modules: ResolvedPermissionModuleDto[];
  permissions: ResolvedPermissionDto[];
}
