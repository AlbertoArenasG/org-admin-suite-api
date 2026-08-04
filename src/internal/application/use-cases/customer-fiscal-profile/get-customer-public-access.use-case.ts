import { Inject, Injectable } from '@nestjs/common';

import { CustomerPublicAccessViewDto } from '@application/dto';
import {
  ICustomerReadRepository,
  ICustomerReadRepositoryToken,
} from '@domain/ports/repositories';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
} from '@domain/exceptions';
import { CustomerStatus } from '@domain/entities';

@Injectable()
export class GetCustomerPublicAccessUseCase {
  constructor(
    @Inject(ICustomerReadRepositoryToken)
    private readonly customerReadRepository: ICustomerReadRepository,
  ) {}

  async execute(customerId: string): Promise<CustomerPublicAccessViewDto> {
    const { data: customer } =
      await this.customerReadRepository.findById(customerId);

    if (!customer || customer.status === CustomerStatus.DELETED) {
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.CUSTOMER,
        { id: customerId },
      );
    }

    return {
      customerId: customer.id,
      publicAccessToken: customer.accessToken ?? null,
    };
  }
}
