import { Injectable } from '@nestjs/common';

import { IUserCustomerRelationshipReadRepository } from '@domain/ports/repositories';
import { UserCustomerRelationship } from '@domain/entities';
import { MongooseUserCustomerRelationshipBaseRepository } from './mongoose-user-customer-relationship-base.repository';

@Injectable()
export class MongooseUserCustomerRelationshipReadRepositoryImpl
  extends MongooseUserCustomerRelationshipBaseRepository
  implements IUserCustomerRelationshipReadRepository
{
  async findByUserId(
    userId: string,
  ): Promise<{ data: UserCustomerRelationship[] }> {
    return this.findMany({ user_id: userId });
  }

  async findByUserIdAndCustomerId(
    userId: string,
    customerId: string,
  ): Promise<{ data: UserCustomerRelationship | null }> {
    const document = await this.relationshipModel
      .findOne({ user_id: userId, customer_id: customerId })
      .session(this.transactionContext.getSession() ?? null)
      .exec();

    return {
      data: document ? this.toDomain(document) : null,
    };
  }

  async findByUserIds(
    userIds: string[],
  ): Promise<{ data: UserCustomerRelationship[] }> {
    if (userIds.length === 0) {
      return { data: [] };
    }

    return this.findMany({ user_id: { $in: userIds } });
  }

  async findByCustomerId(
    customerId: string,
  ): Promise<{ data: UserCustomerRelationship[] }> {
    return this.findMany({ customer_id: customerId });
  }

  private async findMany(filter: Record<string, unknown>): Promise<{
    data: UserCustomerRelationship[];
  }> {
    const documents = await this.relationshipModel
      .find(filter)
      .session(this.transactionContext.getSession() ?? null)
      .exec();

    return {
      data: documents
        .map((document) => this.toDomain(document))
        .filter(
          (relationship): relationship is UserCustomerRelationship =>
            relationship !== null,
        ),
    };
  }
}
