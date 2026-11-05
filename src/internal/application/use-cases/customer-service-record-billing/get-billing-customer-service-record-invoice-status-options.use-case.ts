import { Injectable } from '@nestjs/common';
import { CustomerServiceRecordInvoiceStatus } from '@domain/entities';

@Injectable()
export class GetBillingCustomerServiceRecordInvoiceStatusOptionsUseCase {
  execute(): string[] {
    return Object.values(CustomerServiceRecordInvoiceStatus);
  }
}
