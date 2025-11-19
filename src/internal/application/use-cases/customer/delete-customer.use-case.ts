import { Inject, Injectable } from '@nestjs/common';

import {
  ICustomerReadRepository,
  ICustomerReadRepositoryToken,
  ICustomerWriteRepository,
  ICustomerWriteRepositoryToken,
} from '@domain/ports/repositories';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
} from '@domain/exceptions';
import { CustomerStatus } from '@domain/entities';

@Injectable()
export class DeleteCustomerUseCase {
  constructor(
    @Inject(ICustomerReadRepositoryToken)
    private readonly customerReadRepository: ICustomerReadRepository,
    @Inject(ICustomerWriteRepositoryToken)
    private readonly customerWriteRepository: ICustomerWriteRepository,
  ) {}

  async execute(customerId: string): Promise<void> {
    const { data: customer } =
      await this.customerReadRepository.findById(customerId);

    if (!customer || customer.status === CustomerStatus.DELETED) {
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.CUSTOMER,
        { id: customerId },
      );
    }

    customer.markAsDeleted();
    await this.customerWriteRepository.update(customer);
  }
}
