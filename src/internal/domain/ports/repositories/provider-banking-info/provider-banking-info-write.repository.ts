import { ProviderBankingInfo } from '@domain/entities';

export interface IProviderBankingInfoWriteRepository {
  create(
    bankingInfo: ProviderBankingInfo,
  ): Promise<{ data: ProviderBankingInfo | null }>;
  update(
    bankingInfo: ProviderBankingInfo,
  ): Promise<{ data: ProviderBankingInfo | null }>;
}

export const IProviderBankingInfoWriteRepositoryToken = Symbol(
  'IProviderBankingInfoWriteRepository',
);
