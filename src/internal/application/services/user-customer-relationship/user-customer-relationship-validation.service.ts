import { Inject, Injectable } from '@nestjs/common';

import { CustomerStatus, SystemRole } from '@domain/entities';
import {
  ICustomerReadRepository,
  ICustomerReadRepositoryToken,
} from '@domain/ports/repositories';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
  InvalidValueException,
  InvalidValueExceptionCode,
} from '@domain/exceptions';

@Injectable()
export class UserCustomerRelationshipValidationService {
  constructor(
    @Inject(ICustomerReadRepositoryToken)
    private readonly customerReadRepository: ICustomerReadRepository,
  ) {}

  async validateCustomerIds(
    customerIds: string[],
    systemRole: SystemRole,
    existingCustomerIds: string[] = [],
  ): Promise<string[]> {
    const normalizedCustomerIds = customerIds.map((customerId) =>
      customerId.trim(),
    );

    if (
      normalizedCustomerIds.some((customerId) => customerId.length === 0) ||
      new Set(normalizedCustomerIds).size !== normalizedCustomerIds.length
    ) {
      throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
        field: 'customer_ids',
      });
    }

    if (normalizedCustomerIds.length > 0 && systemRole !== SystemRole.USER) {
      throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
        field: 'customer_ids',
        systemRole,
      });
    }

    if (normalizedCustomerIds.length === 0) {
      return [];
    }

    const { data: customers } = await this.customerReadRepository.findByIds(
      normalizedCustomerIds,
    );
    const customersById = new Map(
      customers.map((customer) => [customer.id, customer]),
    );
    const missingCustomerIds = normalizedCustomerIds.filter(
      (customerId) => !customersById.has(customerId),
    );

    if (missingCustomerIds.length > 0) {
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.CUSTOMER,
        {
          ids: missingCustomerIds,
        },
      );
    }

    const existingCustomerIdSet = new Set(existingCustomerIds);
    const inactiveCustomerIds = customers
      .filter(
        (customer) =>
          customer.status !== CustomerStatus.ACTIVE &&
          !existingCustomerIdSet.has(customer.id),
      )
      .map((customer) => customer.id);

    if (inactiveCustomerIds.length > 0) {
      throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
        field: 'customer_ids',
        ids: inactiveCustomerIds,
      });
    }

    return normalizedCustomerIds;
  }
}
