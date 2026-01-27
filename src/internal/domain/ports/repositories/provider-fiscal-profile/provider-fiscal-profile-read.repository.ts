import {
  ProviderFiscalProfile,
  ProviderFiscalProfileStatus,
} from '@domain/entities';

export interface FindProviderFiscalProfilesParams {
  page: number;
  perPage: number;
  status?: ProviderFiscalProfileStatus | null;
  sorts: Array<{
    field: 'business_name' | 'status' | 'submitted_at' | 'created_at';
    direction: 'asc' | 'desc';
  }>;
}

export interface FindProviderFiscalProfilesResult {
  data: ProviderFiscalProfile[];
  total: number;
}

export interface IProviderFiscalProfileReadRepository {
  findById(id: string): Promise<{ data: ProviderFiscalProfile | null }>;
  findByProviderId(
    providerId: string,
  ): Promise<{ data: ProviderFiscalProfile | null }>;
  findAll(
    params: FindProviderFiscalProfilesParams,
  ): Promise<FindProviderFiscalProfilesResult>;
}

export const IProviderFiscalProfileReadRepositoryToken = Symbol(
  'IProviderFiscalProfileReadRepository',
);
