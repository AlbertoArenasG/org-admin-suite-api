import {
  PaginatedResultDto,
  PaginationParamsDto,
} from '@application/dto/shared';
import { CustomerServiceRecordOperationalStatus } from '@domain/entities';

export interface CustomerServiceRecordIntervalDto {
  years: number;
  months: number;
  weeks: number;
  days: number;
}

export interface CustomerServiceRecordAssetInputDto {
  name: string;
  identifier: string;
  brand: string;
  model: string;
  serialNumber: string;
  observations: string | null;
}

export interface CustomerServiceRecordCustomerInputDto {
  customerId: string;
  customerUserIds: string[];
}

export interface CustomerServiceRecordFollowUpRuleInputDto {
  interval: CustomerServiceRecordIntervalDto;
  recipientGroupIds: string[];
  ccRecipientGroupIds: string[];
}

export interface CustomerServiceRecordProviderInputDto {
  providerId: string;
  deliveredToProviderAt: string | null;
  estimatedReturnInterval: CustomerServiceRecordIntervalDto;
  estimatedReturnAt: string | null;
  returnedFromProviderAt: string | null;
  statusPolicyId: string | null;
  notificationPolicyId: string | null;
  followUp: {
    enabled: boolean;
    rules: CustomerServiceRecordFollowUpRuleInputDto[];
  };
}

export interface CustomerServiceRecordCustomerDeliveryInputDto {
  receivedAt: string | null;
  estimatedDeliveryInterval: CustomerServiceRecordIntervalDto;
  estimatedDeliveryAt: string | null;
  deliveredToCustomerAt: string | null;
  statusPolicyId: string | null;
  notificationPolicyId: string | null;
}

export interface CreateCustomerServiceRecordDto {
  actorUserId: string;
  serviceTypeCode: string;
  requestedAt: string;
  observations: string | null;
  customer: CustomerServiceRecordCustomerInputDto;
  assets: CustomerServiceRecordAssetInputDto[];
  customerDelivery: CustomerServiceRecordCustomerDeliveryInputDto;
  provider: CustomerServiceRecordProviderInputDto | null;
  operationalStatus: CustomerServiceRecordOperationalStatus;
}

export interface UpdateCustomerServiceRecordDto {
  recordId: string;
  actorUserId: string;
  serviceTypeCode?: string;
  requestedAt?: string;
  observations?: string | null;
  customer?: CustomerServiceRecordCustomerInputDto;
  assets?: CustomerServiceRecordAssetInputDto[];
  customerDelivery?: Partial<CustomerServiceRecordCustomerDeliveryInputDto>;
  provider?: CustomerServiceRecordProviderInputDto | null;
  operationalStatus?: CustomerServiceRecordOperationalStatus;
}

export interface DeleteCustomerServiceRecordDto {
  actorUserId: string;
  recordId: string;
}

export interface GetCustomerServiceRecordsDto extends PaginationParamsDto {
  search: string | null;
  operationalStatus: CustomerServiceRecordOperationalStatus | null;
  serviceTypeCode: string | null;
  customerId: string | null;
  customerUserId: string | null;
  providerId: string | null;
  hasProvider: boolean | null;
  requestedAtFrom: string | null;
  requestedAtTo: string | null;
  receivedAtFrom: string | null;
  receivedAtTo: string | null;
  estimatedCustomerDeliveryAtFrom: string | null;
  estimatedCustomerDeliveryAtTo: string | null;
  providerEstimatedReturnAtFrom: string | null;
  providerEstimatedReturnAtTo: string | null;
  sorts: Array<{
    field:
      | 'service_number'
      | 'requested_at'
      | 'received_at'
      | 'estimated_customer_delivery_at'
      | 'provider_estimated_return_at'
      | 'operational_status'
      | 'created_at';
    direction: 'asc' | 'desc';
  }>;
}

export interface CustomerServiceRecordViewDto {
  id: string;
  serviceNumber: number;
  serviceType: { code: string; name: string };
  requestedAt: string;
  observations: string | null;
  customer: {
    customerId: string;
    customerName: string;
    users: Array<{ userId: string; name: string; email: string }>;
  };
  assets: Array<CustomerServiceRecordAssetInputDto & { assetId: string }>;
  customerDelivery: any;
  provider: any;
  operationalStatus: CustomerServiceRecordOperationalStatus;
  createdAt: Date;
  updatedAt: Date | null;
}

export type GetCustomerServiceRecordsResultDto =
  PaginatedResultDto<CustomerServiceRecordViewDto>;
export type GetCustomerServiceRecordByIdResultDto =
  CustomerServiceRecordViewDto;
export type CreateCustomerServiceRecordResultDto = CustomerServiceRecordViewDto;
export type UpdateCustomerServiceRecordResultDto = CustomerServiceRecordViewDto;

export interface RefreshCustomerServiceRecordMaterializationsDto {
  cursor: string | null;
}
export interface RefreshCustomerServiceRecordMaterializationsResultDto {
  processedRecords: number;
  materializations: {
    customerDeliveryStatus: { refreshedRecords: number };
    customerDeliveryNotification: { refreshedRecords: number };
    providerStatus: { refreshedRecords: number };
    providerNotification: { refreshedRecords: number };
    providerFollowUp: { refreshedRecords: number };
  };
  durationMs: number;
  nextCursor: string | null;
}
