import { Injectable } from '@nestjs/common';

import {
  CustomerServiceRecordClientAccessCustomerOptionDto,
  GetCustomerServiceRecordClientAccessOptionsDto,
} from '@application/dto';
import { CustomerServiceRecordClientAccessUseCase } from './customer-service-record-client-access.shared';
@Injectable()
export class GetCustomerServiceRecordClientAccessCustomerOptionsUseCase extends CustomerServiceRecordClientAccessUseCase {
  async execute(
    input: GetCustomerServiceRecordClientAccessOptionsDto,
  ): Promise<CustomerServiceRecordClientAccessCustomerOptionDto[]> {
    const visibility = await this.visibility.resolve(input.actorUserId);
    return this.repository.findCustomerOptions({ ...input, ...visibility });
  }
}
