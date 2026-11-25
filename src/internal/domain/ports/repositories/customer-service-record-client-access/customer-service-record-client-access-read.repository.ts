import { CustomerServiceRecord } from '@domain/entities';
import type {
  CustomerServiceRecordSortStrategy,
  CustomerServiceRecordTimelineMatch,
  CustomerServiceRecordTimelineReadModel,
} from '../customer-service-record';

export interface FindCustomerServiceRecordClientAccessTimelineParams {
  actorUserId: string;
  customerIds: string[];
  isInternalStaff: boolean;
  from: string;
  to: string;
  match: CustomerServiceRecordTimelineMatch;
  page: number;
  perPage: number;
}

export type CustomerServiceRecordClientAccessTimelineReadModel = Omit<
  CustomerServiceRecordTimelineReadModel,
  'provider'
>;

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
  sortStrategy?: CustomerServiceRecordSortStrategy | null;
  sorts?: Array<{
    field: CustomerServiceRecordClientAccessSortField;
    direction: 'asc' | 'desc';
  }>;
}

export interface ICustomerServiceRecordClientAccessReadRepository {
  findTimeline(
    params: FindCustomerServiceRecordClientAccessTimelineParams,
  ): Promise<{
    data: CustomerServiceRecordClientAccessTimelineReadModel[];
    total: number;
  }>;
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
