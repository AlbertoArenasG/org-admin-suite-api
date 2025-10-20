import { Tenant } from '@domain/entities';

export interface ITenantReadRepository {
  findBySlug(slug: string): Promise<{ data: Tenant | null }>;
}

export const ITenantReadRepositoryToken = Symbol('ITenantReadRepository');
