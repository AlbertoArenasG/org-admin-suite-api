import { TenantUser } from '@domain/entities';

export interface ITenantUserReadRepository {
  findManyByUserId(userId: string): Promise<{ data: TenantUser[] }>;
}

export const ITenantUserReadRepositoryToken = Symbol(
  'ITenantUserReadRepository',
);
