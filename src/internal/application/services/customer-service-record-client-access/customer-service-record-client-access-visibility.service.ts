import { Inject, Injectable } from '@nestjs/common';

import {
  IUserCustomerRelationshipReadRepository,
  IUserCustomerRelationshipReadRepositoryToken,
  IUserReadRepository,
  IUserReadRepositoryToken,
} from '@domain/ports/repositories';

@Injectable()
export class CustomerServiceRecordClientAccessVisibilityService {
  constructor(
    @Inject(IUserCustomerRelationshipReadRepositoryToken)
    private readonly relationships: IUserCustomerRelationshipReadRepository,
    @Inject(IUserReadRepositoryToken)
    private readonly users: IUserReadRepository,
  ) {}

  async resolve(
    actorUserId: string,
  ): Promise<{ customerIds: string[]; isInternalStaff: boolean }> {
    const { data: user } = await this.users.findById(actorUserId);
    if (!user) return { customerIds: [], isInternalStaff: false };
    if (user.isInternalStaff === true)
      return { customerIds: [], isInternalStaff: true };
    const { data } = await this.relationships.findByUserId(actorUserId);
    return {
      customerIds: [
        ...new Set(data.map((relationship) => relationship.customerId)),
      ],
      isInternalStaff: false,
    };
  }
}
