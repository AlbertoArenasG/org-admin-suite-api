export interface CustomerServiceRecordBillingNotice {
  serviceNumberDisplay: string;
  customerName: string;
  assets: Array<{
    name: string;
    identifier: string;
    brand: string;
    model: string;
    serialNumber: string;
    observations: string | null;
  }>;
}

export interface ICustomerServiceRecordBillingNoticeSender {
  /** Returns false when there are no recipients and no delivery was attempted. */
  send(notice: CustomerServiceRecordBillingNotice): Promise<boolean>;
}

export const ICustomerServiceRecordBillingNoticeSenderToken = Symbol(
  'ICustomerServiceRecordBillingNoticeSender',
);
