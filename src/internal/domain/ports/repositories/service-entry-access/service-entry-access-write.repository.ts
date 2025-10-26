import { ServiceEntryAccess } from '@domain/entities';

export interface IServiceEntryAccessWriteRepository {
  create(
    access: ServiceEntryAccess,
  ): Promise<{ data: ServiceEntryAccess | null }>;
  update(
    access: ServiceEntryAccess,
  ): Promise<{ data: ServiceEntryAccess | null }>;
}

export const IServiceEntryAccessWriteRepositoryToken = Symbol(
  'IServiceEntryAccessWriteRepository',
);
