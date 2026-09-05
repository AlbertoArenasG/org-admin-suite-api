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
    const visibility = await this.visibility.resolve(input.actorUserId);
    const { data, total } = await this.repository.findAll({
      ...input,
      ...visibility,
    });
    return {
      items: data.map(CustomerServiceRecordClientAccessMapper.toViewDto),
      total,
      page: input.page,
      perPage: input.perPage,
    };
  }
}
