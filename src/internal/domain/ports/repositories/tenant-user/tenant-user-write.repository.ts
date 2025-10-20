import { TenantUser } from '@domain/entities';

export interface ITenantUserWriteRepository {
  create(tenantUser: TenantUser): Promise<{ data: TenantUser | null }>;
}

export const ITenantUserWriteRepositoryToken = Symbol(
  'ITenantUserWriteRepository',
);
