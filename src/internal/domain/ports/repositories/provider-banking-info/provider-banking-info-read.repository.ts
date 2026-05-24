import {
  ProviderBankingInfo,
  ProviderBankingInfoStatus,
} from '@domain/entities';

export interface FindProviderBankingInfosParams {
  page: number;
  perPage: number;
  status?: ProviderBankingInfoStatus | null;
  sorts: Array<{
    field: 'beneficiary' | 'status' | 'submitted_at' | 'created_at';
    direction: 'asc' | 'desc';
  }>;
}

export interface FindProviderBankingInfosResult {
  data: ProviderBankingInfo[];
  total: number;
}

export interface IProviderBankingInfoReadRepository {
  findById(id: string): Promise<{ data: ProviderBankingInfo | null }>;
  findByProviderId(
    providerId: string,
  ): Promise<{ data: ProviderBankingInfo | null }>;
  findAll(
    params: FindProviderBankingInfosParams,
  ): Promise<FindProviderBankingInfosResult>;
}

export const IProviderBankingInfoReadRepositoryToken = Symbol(
  'IProviderBankingInfoReadRepository',
);
