import { CustomerServiceRecordServiceType } from '@domain/entities';

export interface ICustomerServiceRecordServiceTypeWriteRepository {
  create(
    serviceType: CustomerServiceRecordServiceType,
  ): Promise<{ data: CustomerServiceRecordServiceType | null }>;
  update(
    serviceType: CustomerServiceRecordServiceType,
  ): Promise<{ data: CustomerServiceRecordServiceType | null }>;
}

export const ICustomerServiceRecordServiceTypeWriteRepositoryToken = Symbol(
  'ICustomerServiceRecordServiceTypeWriteRepository',
);
