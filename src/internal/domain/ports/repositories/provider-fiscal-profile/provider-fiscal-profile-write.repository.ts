import { ProviderFiscalProfile } from '@domain/entities';

export interface IProviderFiscalProfileWriteRepository {
  create(
    profile: ProviderFiscalProfile,
  ): Promise<{ data: ProviderFiscalProfile | null }>;
  update(
    profile: ProviderFiscalProfile,
  ): Promise<{ data: ProviderFiscalProfile | null }>;
}

export const IProviderFiscalProfileWriteRepositoryToken = Symbol(
  'IProviderFiscalProfileWriteRepository',
);
