import { Injectable } from '@nestjs/common';

import {
  CustomerServiceRecordClientAccessServiceTypeOptionDto,
  GetCustomerServiceRecordClientAccessOptionsDto,
} from '@application/dto';
import { CustomerServiceRecordClientAccessUseCase } from './customer-service-record-client-access.shared';
@Injectable()
export class GetCustomerServiceRecordClientAccessServiceTypeOptionsUseCase extends CustomerServiceRecordClientAccessUseCase {
  async execute(
    input: GetCustomerServiceRecordClientAccessOptionsDto,
  ): Promise<CustomerServiceRecordClientAccessServiceTypeOptionDto[]> {
    const customerIds = await this.visibility.resolveCustomerIds(
      input.actorUserId,
    );
    return this.repository.findServiceTypeOptions({ ...input, customerIds });
  }
}
