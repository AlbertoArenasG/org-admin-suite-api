import { Inject, Injectable } from '@nestjs/common';
import {
  GetBillingCustomerServiceRecordsDto,
  GetBillingCustomerServiceRecordsResultDto,
} from '@application/dto/customer-service-record-billing';
import { BillingCustomerServiceRecordMapper } from '@application/mappers/customer-service-record-billing';
import {
  IBillingCustomerServiceRecordReadRepository,
  IBillingCustomerServiceRecordReadRepositoryToken,
} from '@domain/ports/repositories/customer-service-record-billing';

@Injectable()
export class GetBillingCustomerServiceRecordsUseCase {
  constructor(
    @Inject(IBillingCustomerServiceRecordReadRepositoryToken)
    private readonly readRepository: IBillingCustomerServiceRecordReadRepository,
  ) {}

  async execute(
    input: GetBillingCustomerServiceRecordsDto,
  ): Promise<GetBillingCustomerServiceRecordsResultDto> {
    const { data, total } = await this.readRepository.findAll(input);
    return {
      items: data.map((record) =>
        BillingCustomerServiceRecordMapper.toViewDto(record),
      ),
      total,
      page: input.page,
      perPage: input.perPage,
    };
  }
}
