import { ServiceEntryAccess } from '@domain/entities';

export interface IServiceEntryAccessReadRepository {
  findByTokenHash(
    tokenHash: string,
  ): Promise<{ data: ServiceEntryAccess | null }>;
  findByServiceEntryId(
    serviceEntryId: string,
  ): Promise<{ data: ServiceEntryAccess | null }>;
  findByServiceEntryIds(
    serviceEntryIds: string[],
  ): Promise<{ data: ServiceEntryAccess[] }>;
}

export const IServiceEntryAccessReadRepositoryToken = Symbol(
  'IServiceEntryAccessReadRepository',
);
