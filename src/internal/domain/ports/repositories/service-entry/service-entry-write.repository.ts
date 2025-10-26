import { ServiceEntry } from '@domain/entities';

export interface IServiceEntryWriteRepository {
  create(entry: ServiceEntry): Promise<{ data: ServiceEntry | null }>;
  update(entry: ServiceEntry): Promise<{ data: ServiceEntry | null }>;
}

export const IServiceEntryWriteRepositoryToken = Symbol(
  'IServiceEntryWriteRepository',
);
