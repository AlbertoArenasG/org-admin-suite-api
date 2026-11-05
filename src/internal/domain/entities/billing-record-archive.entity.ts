import {
  CustomerServiceRecordBillingProps,
  CustomerServiceRecordInvoiceProps,
} from './customer-service-record.entity';

export interface BillingRecordArchive {
  id: string;
  recordId: string;
  invoiceRevision: number;
  invoice: CustomerServiceRecordInvoiceProps;
  billing: Omit<CustomerServiceRecordBillingProps, 'instructions'>;
  archivedAt: Date;
  archivedBy: string;
}
