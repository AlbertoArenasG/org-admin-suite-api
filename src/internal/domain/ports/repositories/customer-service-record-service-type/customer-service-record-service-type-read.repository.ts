import { CustomerServiceRecordServiceType } from '@domain/entities';

export interface ICustomerServiceRecordServiceTypeReadRepository {
  findById(
    serviceTypeId: string,
  ): Promise<{ data: CustomerServiceRecordServiceType | null }>;
  findByCode(
    code: string,
  ): Promise<{ data: CustomerServiceRecordServiceType | null }>;
  findByName(
    name: string,
  ): Promise<{ data: CustomerServiceRecordServiceType | null }>;
  findAll(input: {
    page: number;
    perPage: number;
    status?: string | null;
  }): Promise<{ data: CustomerServiceRecordServiceType[]; total: number }>;
  findActive(): Promise<{ data: CustomerServiceRecordServiceType[] }>;
}

export const ICustomerServiceRecordServiceTypeReadRepositoryToken = Symbol(
  'ICustomerServiceRecordServiceTypeReadRepository',
);
