import { Inject, Injectable } from '@nestjs/common';
import {
  GetCustomerServiceRecordsDto,
  GetCustomerServiceRecordsResultDto,
} from '@application/dto';
import { CustomerServiceRecordMapper } from '@application/mappers';
import {
  ICustomerServiceRecordReadRepository,
  ICustomerServiceRecordReadRepositoryToken,
} from '@domain/ports/repositories';
@Injectable()
export class GetCustomerServiceRecordsUseCase {
  constructor(
    @Inject(ICustomerServiceRecordReadRepositoryToken)
    private readonly readRepository: ICustomerServiceRecordReadRepository,
  ) {}
  async execute(
    input: GetCustomerServiceRecordsDto,
  ): Promise<GetCustomerServiceRecordsResultDto> {
    const { data, total } = await this.readRepository.findAll(input);
    return {
      items: data.map(CustomerServiceRecordMapper.toViewDto),
      total,
      page: input.page,
      perPage: input.perPage,
    };
  }
}
