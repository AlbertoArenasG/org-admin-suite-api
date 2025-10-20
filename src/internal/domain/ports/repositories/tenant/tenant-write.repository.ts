import { Tenant } from '@domain/entities';

export interface ITenantWriteRepository {
  create(tenant: Tenant): Promise<{ data: Tenant | null }>;
}

export const ITenantWriteRepositoryToken = Symbol('ITenantWriteRepository');
