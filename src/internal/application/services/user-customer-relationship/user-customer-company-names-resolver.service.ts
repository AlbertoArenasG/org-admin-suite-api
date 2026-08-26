import { Inject, Injectable } from '@nestjs/common';

import {
  ICustomerReadRepository,
  ICustomerReadRepositoryToken,
  IUserCustomerRelationshipReadRepository,
  IUserCustomerRelationshipReadRepositoryToken,
} from '@domain/ports/repositories';

export interface UserCompanyNamesResolution {
  userId: string;
  companyNames: string[];
}

@Injectable()
export class UserCustomerCompanyNamesResolver {
  constructor(
    @Inject(IUserCustomerRelationshipReadRepositoryToken)
    private readonly relationshipReadRepository: IUserCustomerRelationshipReadRepository,
    @Inject(ICustomerReadRepositoryToken)
    private readonly customerReadRepository: ICustomerReadRepository,
  ) {}

  async resolveForUserIds(
    userIds: string[],
  ): Promise<UserCompanyNamesResolution[]> {
    if (userIds.length === 0) {
      return [];
    }

    const { data: relationships } =
      await this.relationshipReadRepository.findByUserIds(userIds);
    const customerIds = [
      ...new Set(relationships.map((relationship) => relationship.customerId)),
    ];
    const { data: customers } =
      await this.customerReadRepository.findByIds(customerIds);
    const companyNameByCustomerId = new Map(
      customers.map((customer) => [customer.id, customer.companyName]),
    );
    const customerIdsByUserId = new Map<string, string[]>();

    for (const relationship of relationships) {
      const current = customerIdsByUserId.get(relationship.userId) ?? [];
      current.push(relationship.customerId);
      customerIdsByUserId.set(relationship.userId, current);
    }

    return userIds.map((userId) => ({
      userId,
      companyNames: this.normalizeCompanyNames(
        (customerIdsByUserId.get(userId) ?? [])
          .map((customerId) => companyNameByCustomerId.get(customerId))
          .filter((companyName): companyName is string => Boolean(companyName)),
      ),
    }));
  }

  private normalizeCompanyNames(companyNames: string[]): string[] {
    return [...new Set(companyNames)]
      .map((companyName) => companyName.trim())
      .filter(Boolean)
      .sort((left, right) => left.localeCompare(right));
  }
}
