import {
  CustomerServiceRecord,
  CustomerServiceRecordOperationalStatus,
} from '@domain/entities';

export type CustomerServiceRecordSortField =
  | 'service_number'
  | 'requested_at'
  | 'received_at'
  | 'estimated_customer_delivery_at'
  | 'provider_estimated_return_at'
  | 'operational_status'
  | 'created_at';

export interface FindCustomerServiceRecordsParams {
  page: number;
  perPage: number;
  search?: string | null;
  operationalStatus?: CustomerServiceRecordOperationalStatus | null;
  serviceTypeCode?: string | null;
  customerId?: string | null;
  customerUserId?: string | null;
  providerId?: string | null;
  hasProvider?: boolean | null;
  requestedAtFrom?: string | null;
  requestedAtTo?: string | null;
  receivedAtFrom?: string | null;
  receivedAtTo?: string | null;
  estimatedCustomerDeliveryAtFrom?: string | null;
  estimatedCustomerDeliveryAtTo?: string | null;
  providerEstimatedReturnAtFrom?: string | null;
  providerEstimatedReturnAtTo?: string | null;
  sorts: Array<{
    field: CustomerServiceRecordSortField;
    direction: 'asc' | 'desc';
  }>;
}

export interface CustomerServiceRecordOperationalCursor {
  createdAt: Date;
  recordId: string;
}

export interface FindOperationalCustomerServiceRecordsParams {
  after?: CustomerServiceRecordOperationalCursor;
  limit: number;
  statusPolicyId?: string | null;
  notificationPolicyId?: string | null;
  commitment?: 'CUSTOMER_DELIVERY' | 'PROVIDER_RETURN' | null;
}

export interface ICustomerServiceRecordReadRepository {
  findById(recordId: string): Promise<{ data: CustomerServiceRecord | null }>;
  findAll(
    params: FindCustomerServiceRecordsParams,
  ): Promise<{ data: CustomerServiceRecord[]; total: number }>;
  findOperational(
    params: FindOperationalCustomerServiceRecordsParams,
  ): Promise<{ data: CustomerServiceRecord[] }>;
}

export const ICustomerServiceRecordReadRepositoryToken = Symbol(
  'ICustomerServiceRecordReadRepository',
);
