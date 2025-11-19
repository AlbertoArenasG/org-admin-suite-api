import { CustomerFiscalProfile } from '@domain/entities';

export interface ICustomerFiscalProfileWriteRepository {
  create(
    profile: CustomerFiscalProfile,
  ): Promise<{ data: CustomerFiscalProfile | null }>;
  update(
    profile: CustomerFiscalProfile,
  ): Promise<{ data: CustomerFiscalProfile | null }>;
}

export const ICustomerFiscalProfileWriteRepositoryToken = Symbol(
  'ICustomerFiscalProfileWriteRepository',
);
