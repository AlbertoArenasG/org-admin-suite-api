import { Inject, Injectable } from '@nestjs/common';

import { GetCustomerOptionsResultDto } from '@application/dto';
import { CustomerMapper } from '@application/mappers';
import {
  ICustomerReadRepository,
  ICustomerReadRepositoryToken,
} from '@domain/ports/repositories';

@Injectable()
export class GetCustomerOptionsUseCase {
  constructor(
    @Inject(ICustomerReadRepositoryToken)
    private readonly readRepository: ICustomerReadRepository,
  ) {}

  async execute(): Promise<GetCustomerOptionsResultDto> {
    const { data } = await this.readRepository.findOptions();

    return data.map((customer) => CustomerMapper.toOptionDto(customer));
  }
}
