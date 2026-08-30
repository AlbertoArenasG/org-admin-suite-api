import { Inject, Injectable } from '@nestjs/common';

import {
  GetCustomerServiceRecordServiceTypesDto,
  GetCustomerServiceRecordServiceTypesResultDto,
} from '@application/dto';
import { CustomerServiceRecordServiceTypeMapper } from '@application/mappers';
import {
  ICustomerServiceRecordServiceTypeReadRepository,
  ICustomerServiceRecordServiceTypeReadRepositoryToken,
} from '@domain/ports/repositories';

@Injectable()
export class GetCustomerServiceRecordServiceTypesUseCase {
  constructor(
    @Inject(ICustomerServiceRecordServiceTypeReadRepositoryToken)
    private readonly readRepository: ICustomerServiceRecordServiceTypeReadRepository,
  ) {}

  async execute(
    input: GetCustomerServiceRecordServiceTypesDto,
  ): Promise<GetCustomerServiceRecordServiceTypesResultDto> {
    const { data, total } = await this.readRepository.findAll(input);
    return {
      items: data.map(CustomerServiceRecordServiceTypeMapper.toDto),
      total,
      page: input.page,
      perPage: input.perPage,
    };
  }
}
