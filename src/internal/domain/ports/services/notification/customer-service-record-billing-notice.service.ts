export interface CustomerServiceRecordBillingNotice {
  serviceNumberDisplay: string;
  customerName: string;
  requestedAt: string;
  createdAt: Date | null;
  assets: Array<{
    name: string;
    identifier: string;
    brand: string;
    model: string;
    serialNumber: string;
  }>;
}

export interface ICustomerServiceRecordBillingNoticeSender {
  /** Returns false when there are no recipients and no delivery was attempted. */
  send(notice: CustomerServiceRecordBillingNotice): Promise<boolean>;
}

export const ICustomerServiceRecordBillingNoticeSenderToken = Symbol(
  'ICustomerServiceRecordBillingNoticeSender',
);
