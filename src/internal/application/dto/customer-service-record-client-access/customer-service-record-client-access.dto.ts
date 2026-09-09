import {
  PaginatedResultDto,
  PaginationParamsDto,
} from '@application/dto/shared';
import {
  CustomerServiceRecordCustomerDeliveryProps,
  CustomerServiceRecordOperationalStatus,
} from '@domain/entities';

import { CustomerServiceRecordClientAccessSortField } from '@domain/ports/repositories';

export interface GetCustomerServiceRecordClientAccessListDto
  extends PaginationParamsDto {
  actorUserId: string;
  search: string | null;
  customerId: string | null;
  serviceTypeCode: string | null;
  receivedAtFrom: string | null;
  receivedAtTo: string | null;
  estimatedCustomerDeliveryAtFrom: string | null;
  estimatedCustomerDeliveryAtTo: string | null;
  sorts: Array<{
    field: CustomerServiceRecordClientAccessSortField;
    direction: 'asc' | 'desc';
  }>;
}
export type GetCustomerServiceRecordClientAccessOptionsDto = Omit<
  GetCustomerServiceRecordClientAccessListDto,
  'page' | 'perPage' | 'sorts'
>;
export interface CustomerServiceRecordClientAccessAssetDto {
  assetId: string;
  name: string;
  identifier: string;
  brand: string;
  model: string;
  serialNumber: string;
  observations: string | null;
}
export interface CustomerServiceRecordClientAccessViewDto {
  id: string;
  serviceNumber: number;
  serviceNumberDisplay: string;
  serviceType: { code: string; name: string };
  observations: string | null;
  customer: {
    customerId: string;
    customerName: string;
    users: Array<{ userId: string; name: string; email: string }>;
  };
  assets: CustomerServiceRecordClientAccessAssetDto[];
  customerDelivery: CustomerServiceRecordCustomerDeliveryProps;
  operationalStatus: CustomerServiceRecordOperationalStatus;
  createdAt: Date;
}
export type GetCustomerServiceRecordClientAccessListResultDto =
  PaginatedResultDto<CustomerServiceRecordClientAccessViewDto>;
export type CustomerServiceRecordClientAccessCustomerOptionDto = {
  customerId: string;
  name: string;
};
export type CustomerServiceRecordClientAccessServiceTypeOptionDto = {
  code: string;
  name: string;
};
