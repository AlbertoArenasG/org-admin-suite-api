import { ServiceEntryAccess } from '@domain/entities';

export interface IServiceEntryAccessReadRepository {
  findByTokenHash(
    tokenHash: string,
  ): Promise<{ data: ServiceEntryAccess | null }>;
  findByServiceEntryId(
    serviceEntryId: string,
  ): Promise<{ data: ServiceEntryAccess | null }>;
}

export const IServiceEntryAccessReadRepositoryToken = Symbol(
  'IServiceEntryAccessReadRepository',
);
