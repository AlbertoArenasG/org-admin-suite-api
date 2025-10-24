import { ServiceEntry } from '@domain/entities';

export interface IServiceEntryRepository {
  create(entry: ServiceEntry): Promise<{ data: ServiceEntry | null }>;
  findByServiceOrderIdentifier(
    serviceOrderIdentifier: string,
  ): Promise<{ data: ServiceEntry | null }>;
}

export const IServiceEntryRepositoryToken = Symbol('IServiceEntryRepository');
