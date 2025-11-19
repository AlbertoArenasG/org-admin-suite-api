import { CustomerFiscalProfile } from '@domain/entities';

export interface ICustomerFiscalProfileReadRepository {
  findById(id: string): Promise<{ data: CustomerFiscalProfile | null }>;
  findByCustomerId(
    customerId: string,
  ): Promise<{ data: CustomerFiscalProfile | null }>;
  findByCustomerIds(
    customerIds: string[],
  ): Promise<{ data: CustomerFiscalProfile[] }>;
}

export const ICustomerFiscalProfileReadRepositoryToken = Symbol(
  'ICustomerFiscalProfileReadRepository',
);
