import { Injectable } from '@nestjs/common';
import { CustomerServiceRecordBillingStatus } from '@domain/entities';

@Injectable()
export class GetBillingCustomerServiceRecordStatusOptionsUseCase {
  async execute(): Promise<CustomerServiceRecordBillingStatus[]> {
    return [
      CustomerServiceRecordBillingStatus.SUBMITTED,
      CustomerServiceRecordBillingStatus.INVOICED,
    ];
  }
}
