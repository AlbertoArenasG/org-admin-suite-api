import { Provider, ProviderStatus } from '@domain/entities';

export interface FindProvidersParams {
  page: number;
  perPage: number;
  search?: string | null;
  status?: ProviderStatus | null;
  sorts: Array<{
    field: 'company_name' | 'provider_code' | 'provider_status' | 'created_at';
    direction: 'asc' | 'desc';
  }>;
}

export interface FindProvidersResult {
  data: Provider[];
  total: number;
}

export interface IProviderReadRepository {
  findById(id: string): Promise<{ data: Provider | null }>;
  findByProviderCode(providerCode: string): Promise<{ data: Provider | null }>;
  findByAccessToken(accessToken: string): Promise<{ data: Provider | null }>;
  findAll(params: FindProvidersParams): Promise<FindProvidersResult>;
  findOptions(search: string | null): Promise<{ data: Provider[] }>;
}

export const IProviderReadRepositoryToken = Symbol('IProviderReadRepository');
