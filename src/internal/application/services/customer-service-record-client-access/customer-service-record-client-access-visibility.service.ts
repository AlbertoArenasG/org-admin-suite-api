import { Inject, Injectable } from '@nestjs/common';

import {
  IUserCustomerRelationshipReadRepository,
  IUserCustomerRelationshipReadRepositoryToken,
} from '@domain/ports/repositories';

@Injectable()
export class CustomerServiceRecordClientAccessVisibilityService {
  constructor(
    @Inject(IUserCustomerRelationshipReadRepositoryToken)
    private readonly relationships: IUserCustomerRelationshipReadRepository,
  ) {}

  async resolveCustomerIds(actorUserId: string): Promise<string[]> {
    const { data } = await this.relationships.findByUserId(actorUserId);
    return [...new Set(data.map((relationship) => relationship.customerId))];
  }
}
