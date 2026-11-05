import {
  CustomerServiceRecord,
  CustomerServiceRecordBillingStatus,
  CustomerServiceRecordNotificationMaterializationProps,
  CustomerServiceRecordProviderFollowUpMaterializationProps,
  CustomerServiceRecordStatusMaterializationProps,
} from '@domain/entities';

export interface UpdateCustomerServiceRecordMaterializationsParams {
  recordId: string;
  customerDelivery?: {
    statusMaterialization?: CustomerServiceRecordStatusMaterializationProps | null;
    notificationMaterialization?: CustomerServiceRecordNotificationMaterializationProps | null;
  };
  provider?: {
    statusMaterialization?: CustomerServiceRecordStatusMaterializationProps | null;
    notificationMaterialization?: CustomerServiceRecordNotificationMaterializationProps | null;
    followUpMaterialization?: CustomerServiceRecordProviderFollowUpMaterializationProps[];
  };
}

export interface ICustomerServiceRecordWriteRepository {
  create(
    record: CustomerServiceRecord,
  ): Promise<{ data: CustomerServiceRecord | null }>;
  update(
    record: CustomerServiceRecord,
  ): Promise<{ data: CustomerServiceRecord | null }>;
  updateBillingStatus(
    record: CustomerServiceRecord,
    expectedStatus: CustomerServiceRecordBillingStatus,
  ): Promise<{ data: CustomerServiceRecord | null }>;
  updateBillingNotification(
    record: CustomerServiceRecord,
    expectedStatus: CustomerServiceRecordBillingStatus,
  ): Promise<{ data: CustomerServiceRecord | null }>;
  updateBillingInstructions(
    record: CustomerServiceRecord,
  ): Promise<{ data: CustomerServiceRecord | null }>;
  updateBillingInvoice(
    record: CustomerServiceRecord,
    expectedStatus:
      | CustomerServiceRecordBillingStatus.SUBMITTED
      | CustomerServiceRecordBillingStatus.INVOICED,
  ): Promise<{ data: CustomerServiceRecord | null }>;
  updateBillingLifecycle(
    record: CustomerServiceRecord,
    expectedStatus:
      | CustomerServiceRecordBillingStatus.SUBMITTED
      | CustomerServiceRecordBillingStatus.INVOICED,
  ): Promise<{ data: CustomerServiceRecord | null }>;
  updateBillingPurchaseOrder(
    record: CustomerServiceRecord,
    expectedStatus:
      | CustomerServiceRecordBillingStatus.SUBMITTED
      | CustomerServiceRecordBillingStatus.INVOICED,
  ): Promise<{ data: CustomerServiceRecord | null }>;
  archiveBillingInvoice(
    record: CustomerServiceRecord,
    expectedStatus:
      | CustomerServiceRecordBillingStatus.SUBMITTED
      | CustomerServiceRecordBillingStatus.INVOICED,
  ): Promise<{ data: CustomerServiceRecord | null }>;
  markInvoiceOverdueIfCurrent(
    record: CustomerServiceRecord,
    today: string,
  ): Promise<boolean>;
  updateMaterializations(
    params: UpdateCustomerServiceRecordMaterializationsParams,
  ): Promise<{ updated: boolean }>;
}

export const ICustomerServiceRecordWriteRepositoryToken = Symbol(
  'ICustomerServiceRecordWriteRepository',
);
