import {
  CustomerServiceRecordBillingNotificationProps,
  CustomerServiceRecordBillingStatus,
  CustomerServiceRecordOperationalStatus,
} from '@domain/entities';
import { FindBillingCustomerServiceRecordsParams } from '@domain/ports/repositories/customer-service-record-billing';

export type GetBillingCustomerServiceRecordsDto =
  FindBillingCustomerServiceRecordsParams;

export interface BillingCustomerServiceRecordFileAttachmentViewDto {
  fileId: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export interface BillingCustomerServiceRecordDocumentViewDto {
  referenceNumber: string | null;
  files: BillingCustomerServiceRecordFileAttachmentViewDto[];
}

export interface BillingCustomerServiceRecordAssetViewDto {
  assetId: string;
  name: string;
  identifier: string;
  brand: string;
  model: string;
  serialNumber: string;
  observations: string | null;
  intakeConditionFiles: BillingCustomerServiceRecordFileAttachmentViewDto[];
  deliveryConditionFiles: BillingCustomerServiceRecordFileAttachmentViewDto[];
  reports: BillingCustomerServiceRecordFileAttachmentViewDto[];
}

export interface BillingCustomerServiceRecordViewDto {
  id: string;
  serviceNumber: number;
  serviceNumberDisplay: string;
  serviceType: { code: string; name: string };
  requestedAt: string;
  observations: string | null;
  customer: {
    customerId: string;
    customerName: string;
    users: Array<{ userId: string; name: string; email: string }>;
  };
  assets: BillingCustomerServiceRecordAssetViewDto[];
  customerDelivery: any;
  provider: any;
  operationalStatus: CustomerServiceRecordOperationalStatus;
  billingStatus: CustomerServiceRecordBillingStatus;
  billingNotification: CustomerServiceRecordBillingNotificationProps;
  attachmentsCount: number;
  quotation: BillingCustomerServiceRecordDocumentViewDto;
  purchaseOrder: BillingCustomerServiceRecordDocumentViewDto;
  invoice: BillingCustomerServiceRecordDocumentViewDto;
  otherFiles: BillingCustomerServiceRecordFileAttachmentViewDto[];
  createdAt: Date;
  updatedAt: Date | null;
}

export interface GetBillingCustomerServiceRecordsResultDto {
  items: BillingCustomerServiceRecordViewDto[];
  total: number;
  page: number;
  perPage: number;
}

export type GetBillingCustomerServiceRecordByIdResultDto =
  BillingCustomerServiceRecordViewDto;

export interface UpdateBillingCustomerServiceRecordStatusDto {
  recordId: string;
  actorUserId: string;
  billingStatus:
    | CustomerServiceRecordBillingStatus.SUBMITTED
    | CustomerServiceRecordBillingStatus.INVOICED;
}

export interface UpdateBillingCustomerServiceRecordInvoiceDto {
  recordId: string;
  actorUserId: string;
  referenceNumber: string | null;
  fileIds: string[];
}

export type UpdateBillingCustomerServiceRecordStatusResultDto =
  BillingCustomerServiceRecordViewDto;
export type UpdateBillingCustomerServiceRecordInvoiceResultDto =
  BillingCustomerServiceRecordViewDto;
