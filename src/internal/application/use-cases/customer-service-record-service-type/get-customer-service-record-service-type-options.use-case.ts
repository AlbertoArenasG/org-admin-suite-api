import { Inject, Injectable } from '@nestjs/common';

import { GetCustomerServiceRecordServiceTypeOptionsResultDto } from '@application/dto';
import { CustomerServiceRecordServiceTypeMapper } from '@application/mappers';
import {
  ICustomerServiceRecordServiceTypeReadRepository,
  ICustomerServiceRecordServiceTypeReadRepositoryToken,
} from '@domain/ports/repositories';

@Injectable()
export class GetCustomerServiceRecordServiceTypeOptionsUseCase {
  constructor(
    @Inject(ICustomerServiceRecordServiceTypeReadRepositoryToken)
    private readonly readRepository: ICustomerServiceRecordServiceTypeReadRepository,
  ) {}

  async execute(): Promise<GetCustomerServiceRecordServiceTypeOptionsResultDto> {
    const { data } = await this.readRepository.findActive();
    return data.map(CustomerServiceRecordServiceTypeMapper.toOptionDto);
  }
}
