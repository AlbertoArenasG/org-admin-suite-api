import { Injectable } from '@nestjs/common';
import { CustomerServiceRecordBillingStatus } from '@domain/entities';

@Injectable()
export class GetCustomerServiceRecordBillingStatusOptionsUseCase {
  async execute(): Promise<CustomerServiceRecordBillingStatus[]> {
    return Object.values(CustomerServiceRecordBillingStatus);
  }
}
