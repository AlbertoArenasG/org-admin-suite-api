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
    const customerIds = await this.visibility.resolveCustomerIds(
      input.actorUserId,
    );
    return this.repository.findCustomerOptions({ ...input, customerIds });
  }
}
