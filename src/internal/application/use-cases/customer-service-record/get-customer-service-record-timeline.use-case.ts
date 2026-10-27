import { Inject, Injectable } from '@nestjs/common';
import {
  GetCustomerServiceRecordTimelineDto,
  GetCustomerServiceRecordTimelineResultDto,
} from '@application/dto';
import { CustomerServiceRecordTimelineMapper } from '@application/mappers';
import {
  ICustomerServiceRecordReadRepository,
  ICustomerServiceRecordReadRepositoryToken,
} from '@domain/ports/repositories';

@Injectable()
export class GetCustomerServiceRecordTimelineUseCase {
  constructor(
    @Inject(ICustomerServiceRecordReadRepositoryToken)
    private readonly readRepository: ICustomerServiceRecordReadRepository,
  ) {}

  async execute(
    input: GetCustomerServiceRecordTimelineDto,
  ): Promise<GetCustomerServiceRecordTimelineResultDto> {
    const { data, total } = await this.readRepository.findTimeline(input);
    return {
      items: data.map(CustomerServiceRecordTimelineMapper.toViewDto),
      total,
      page: input.page,
      perPage: input.perPage,
    };
  }
}
