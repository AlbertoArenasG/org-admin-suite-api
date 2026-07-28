import { Role, RoleScope, RoleStatus, SystemRole } from '@domain/entities';

export type RoleSortField = 'name' | 'code' | 'status' | 'created_at';
export type RoleSortDirection = 'asc' | 'desc';

export interface FindRolesParams {
  page: number;
  perPage: number;
  actorSystemRole: SystemRole;
  search?: string | null;
  scope?: RoleScope | null;
  status?: RoleStatus | null;
  isSystem?: boolean | null;
  sorts: Array<{ field: RoleSortField; direction: RoleSortDirection }>;
}

export interface FindRolesResult {
  data: Role[];
  total: number;
}

export interface IRoleReadRepository {
  findById(id: string): Promise<{ data: Role | null }>;
  findByCode(code: string): Promise<{ data: Role | null }>;
  findByName(name: string): Promise<{ data: Role | null }>;
  findDefaultByScope(scope: RoleScope): Promise<{ data: Role | null }>;
  findAll(params: FindRolesParams): Promise<FindRolesResult>;
}

export const IRoleReadRepositoryToken = Symbol('IRoleReadRepository');
