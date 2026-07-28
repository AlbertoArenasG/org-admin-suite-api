import {
  AuditUserDto,
  PaginatedResultDto,
  PaginationParamsDto,
} from '@application/dto/shared';
import { RoleScope, RoleStatus } from '@domain/entities';
import { RoleSortDirection, RoleSortField } from '@domain/ports/repositories';

export interface RolePermissionDto {
  module: string;
  operation: string;
}

export interface PermissionModuleViewDto {
  id: string;
  code: string;
  name: string;
  status: string;
  isSystem: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PermissionOperationViewDto {
  id: string;
  code: string;
  name: string;
  status: string;
  isSystem: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RoleViewDto {
  id: string;
  name: string;
  code: string;
  scope: RoleScope;
  isSystem: boolean;
  isImmutable: boolean;
  isDefault: boolean;
  status: RoleStatus;
  permissions: RolePermissionDto[];
  createdBy: AuditUserDto | null;
  updatedBy: AuditUserDto | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateRoleDto {
  name: string;
  permissions: RolePermissionDto[];
  actorUserId: string;
}

export type CreateRoleResultDto = RoleViewDto;

export interface UpdateRoleDto {
  roleId: string;
  permissions?: RolePermissionDto[];
  actorUserId: string;
}

export type UpdateRoleResultDto = RoleViewDto;

export interface GetRolesDto extends PaginationParamsDto {
  search?: string | null;
  scope?: RoleScope | null;
  status?: RoleStatus | null;
  isSystem?: boolean | null;
  sorts: Array<{ field: RoleSortField; direction: RoleSortDirection }>;
}

export type GetRolesResultDto = PaginatedResultDto<RoleViewDto>;

export type GetRoleByIdResultDto = RoleViewDto;
export type GetPermissionModulesResultDto = PermissionModuleViewDto[];
export type GetPermissionOperationsResultDto = PermissionOperationViewDto[];

export interface ChangeRoleStatusDto {
  roleId: string;
  status: RoleStatus.ACTIVE | RoleStatus.INACTIVE;
  actorUserId: string;
}

export type ChangeRoleStatusResultDto = RoleViewDto;

export interface DeleteRoleDto {
  roleId: string;
  actorUserId: string;
}
