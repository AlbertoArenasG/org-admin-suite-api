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
  send(notice: CustomerServiceRecordBillingNotice): Promise<void>;
}

export const ICustomerServiceRecordBillingNoticeSenderToken = Symbol(
  'ICustomerServiceRecordBillingNoticeSender',
);
