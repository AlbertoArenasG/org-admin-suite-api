import {
  CustomerServiceRecord,
  CustomerServiceRecordBillingStatus,
} from '@domain/entities';

export interface FindBillingCustomerServiceRecordsParams {
  page: number;
  perPage: number;
  search: string | null;
  billingStatus:
    | CustomerServiceRecordBillingStatus.SUBMITTED
    | CustomerServiceRecordBillingStatus.INVOICED
    | null;
}

export interface IBillingCustomerServiceRecordReadRepository {
  findAll(
    params: FindBillingCustomerServiceRecordsParams,
  ): Promise<{ data: CustomerServiceRecord[]; total: number }>;
  findById(recordId: string): Promise<{ data: CustomerServiceRecord | null }>;
}

export const IBillingCustomerServiceRecordReadRepositoryToken = Symbol(
  'IBillingCustomerServiceRecordReadRepository',
);
