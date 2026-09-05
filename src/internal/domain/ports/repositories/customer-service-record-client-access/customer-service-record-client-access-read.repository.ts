import { CustomerServiceRecord } from '@domain/entities';

export type CustomerServiceRecordClientAccessSortField =
  | 'service_number'
  | 'received_at'
  | 'estimated_customer_delivery_at';

export interface FindCustomerServiceRecordClientAccessParams {
  actorUserId: string;
  customerIds: string[];
  isInternalStaff: boolean;
  page?: number;
  perPage?: number;
  search?: string | null;
  customerId?: string | null;
  serviceTypeCode?: string | null;
  receivedAtFrom?: string | null;
  receivedAtTo?: string | null;
  estimatedCustomerDeliveryAtFrom?: string | null;
  estimatedCustomerDeliveryAtTo?: string | null;
  sorts?: Array<{
    field: CustomerServiceRecordClientAccessSortField;
    direction: 'asc' | 'desc';
  }>;
}

export interface ICustomerServiceRecordClientAccessReadRepository {
  findAll(params: FindCustomerServiceRecordClientAccessParams): Promise<{
    data: CustomerServiceRecord[];
    total: number;
  }>;
  findById(
    recordId: string,
    actorUserId: string,
    customerIds: string[],
    isInternalStaff: boolean,
  ): Promise<{
    data: CustomerServiceRecord | null;
  }>;
  findCustomerOptions(
    params: FindCustomerServiceRecordClientAccessParams,
  ): Promise<Array<{ customerId: string; name: string }>>;
  findServiceTypeOptions(
    params: FindCustomerServiceRecordClientAccessParams,
  ): Promise<Array<{ code: string; name: string }>>;
}

export const ICustomerServiceRecordClientAccessReadRepositoryToken = Symbol(
  'ICustomerServiceRecordClientAccessReadRepository',
);
