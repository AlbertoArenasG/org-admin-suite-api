import { ServiceEntryAccess } from '@domain/entities';

export interface IServiceEntryAccessRepository {
  create(
    access: ServiceEntryAccess,
  ): Promise<{ data: ServiceEntryAccess | null }>;
  findByTokenHash(
    tokenHash: string,
  ): Promise<{ data: ServiceEntryAccess | null }>;
  update(
    access: ServiceEntryAccess,
  ): Promise<{ data: ServiceEntryAccess | null }>;
}

export const IServiceEntryAccessRepositoryToken = Symbol(
  'IServiceEntryAccessRepository',
);
