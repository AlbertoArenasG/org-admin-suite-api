import { Injectable } from '@nestjs/common';

import {
  GetCustomerServiceRecordClientAccessListDto,
  GetCustomerServiceRecordClientAccessListResultDto,
} from '@application/dto';
import { CustomerServiceRecordClientAccessMapper } from '@application/mappers';
import { CustomerServiceRecordClientAccessUseCase } from './customer-service-record-client-access.shared';
@Injectable()
export class GetCustomerServiceRecordClientAccessListUseCase extends CustomerServiceRecordClientAccessUseCase {
  async execute(
    input: GetCustomerServiceRecordClientAccessListDto,
  ): Promise<GetCustomerServiceRecordClientAccessListResultDto> {
    const customerIds = await this.visibility.resolveCustomerIds(
      input.actorUserId,
    );
    const { data, total } = await this.repository.findAll({
      ...input,
      customerIds,
    });
    return {
      items: data.map(CustomerServiceRecordClientAccessMapper.toViewDto),
      total,
      page: input.page,
      perPage: input.perPage,
    };
  }
}
