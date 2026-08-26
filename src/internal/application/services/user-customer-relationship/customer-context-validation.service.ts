import { Inject, Injectable } from '@nestjs/common';

import { Customer, CustomerStatus } from '@domain/entities';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
  InvalidValueException,
  InvalidValueExceptionCode,
} from '@domain/exceptions';
import {
  ICustomerReadRepository,
  ICustomerReadRepositoryToken,
} from '@domain/ports/repositories';

@Injectable()
export class CustomerContextValidationService {
  constructor(
    @Inject(ICustomerReadRepositoryToken)
    private readonly customerReadRepository: ICustomerReadRepository,
  ) {}

  async ensureReadable(customerId: string): Promise<Customer> {
    return this.findAvailableCustomer(customerId);
  }

  async ensureMutable(customerId: string): Promise<Customer> {
    const customer = await this.findAvailableCustomer(customerId);

    if (customer.status !== CustomerStatus.ACTIVE) {
      throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
        field: 'customer_id',
        customerId,
      });
    }

    return customer;
  }

  private async findAvailableCustomer(customerId: string): Promise<Customer> {
    const { data: customer } =
      await this.customerReadRepository.findById(customerId);

    if (!customer || customer.status === CustomerStatus.DELETED) {
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.CUSTOMER,
        {
          customerId,
        },
      );
    }

    return customer;
  }
}
