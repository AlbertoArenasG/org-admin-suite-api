import { Injectable } from '@nestjs/common';
import {
  GetCustomerServiceRecordClientAccessTimelineDto,
  GetCustomerServiceRecordClientAccessTimelineResultDto,
} from '@application/dto';
import { CustomerServiceRecordClientAccessTimelineMapper } from '@application/mappers';
import { CustomerServiceRecordClientAccessUseCase } from './customer-service-record-client-access.shared';

@Injectable()
export class GetCustomerServiceRecordClientAccessTimelineUseCase extends CustomerServiceRecordClientAccessUseCase {
  async execute(
    input: GetCustomerServiceRecordClientAccessTimelineDto,
  ): Promise<GetCustomerServiceRecordClientAccessTimelineResultDto> {
    const visibility = await this.visibility.resolve(input.actorUserId);
    const { data, total } = await this.repository.findTimeline({
      ...input,
      ...visibility,
    });
    return {
      items: data.map(
        CustomerServiceRecordClientAccessTimelineMapper.toViewDto,
      ),
      total,
      page: input.page,
      perPage: input.perPage,
    };
  }
}
