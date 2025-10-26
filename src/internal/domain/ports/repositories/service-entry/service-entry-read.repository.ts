import { ServiceEntry } from '@domain/entities';

export type ServiceEntrySortField =
  | 'company_name'
  | 'contact_name'
  | 'contact_email'
  | 'service_order_identifier'
  | 'created_at';

export interface FindServiceEntriesParams {
  page: number;
  perPage: number;
  sorts: Array<{ field: ServiceEntrySortField; direction: 'asc' | 'desc' }>;
  search?: string | null;
}

export interface FindServiceEntriesResult {
  data: ServiceEntry[];
  total: number;
}

export interface IServiceEntryReadRepository {
  findById(id: string): Promise<{ data: ServiceEntry | null }>;
  findAll(params: FindServiceEntriesParams): Promise<FindServiceEntriesResult>;
  findByServiceOrderIdentifier(
    serviceOrderIdentifier: string,
  ): Promise<{ data: ServiceEntry | null }>;
  findByIds(ids: string[]): Promise<{ data: ServiceEntry[] }>;
}

export const IServiceEntryReadRepositoryToken = Symbol(
  'IServiceEntryReadRepository',
);
