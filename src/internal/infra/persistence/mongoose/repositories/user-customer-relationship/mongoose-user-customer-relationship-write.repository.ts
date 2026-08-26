import { Injectable } from '@nestjs/common';

import { IUserCustomerRelationshipWriteRepository } from '@domain/ports/repositories';
import { UserCustomerRelationship } from '@domain/entities';
import {
  StateConflictException,
  StateConflictExceptionCode,
} from '@domain/exceptions';
import { MongooseUserCustomerRelationshipBaseRepository } from './mongoose-user-customer-relationship-base.repository';

@Injectable()
export class MongooseUserCustomerRelationshipWriteRepositoryImpl
  extends MongooseUserCustomerRelationshipBaseRepository
  implements IUserCustomerRelationshipWriteRepository
{
  async create(
    relationship: UserCustomerRelationship,
  ): Promise<{ data: UserCustomerRelationship }> {
    try {
      const document = await this.relationshipModel.create(
        [this.toMongoose(relationship)],
        { session: this.transactionContext.getSession() },
      );
      const data = this.toDomain(document[0]);

      return { data: data! };
    } catch (error) {
      if (this.isDuplicateRelationshipError(error)) {
        throw StateConflictException.create(
          StateConflictExceptionCode.USER_CUSTOMER_RELATIONSHIP_ALREADY_EXISTS,
          {
            userId: relationship.userId,
            customerId: relationship.customerId,
          },
        );
      }

      throw error;
    }
  }

  async createMany(
    relationships: UserCustomerRelationship[],
  ): Promise<{ data: UserCustomerRelationship[] }> {
    if (relationships.length === 0) {
      return { data: [] };
    }

    const documents = await this.relationshipModel.insertMany(
      relationships.map((relationship) => this.toMongoose(relationship)),
      { session: this.transactionContext.getSession() },
    );

    return {
      data: documents
        .map((document) => this.toDomain(document))
        .filter(
          (relationship): relationship is UserCustomerRelationship =>
            relationship !== null,
        ),
    };
  }

  async replaceForUser(
    userId: string,
    relationships: UserCustomerRelationship[],
  ): Promise<void> {
    const session = this.transactionContext.getSession();

    await this.relationshipModel
      .deleteMany({ user_id: userId })
      .session(session ?? null)
      .exec();

    if (relationships.length > 0) {
      await this.relationshipModel.insertMany(
        relationships.map((relationship) => this.toMongoose(relationship)),
        { session },
      );
    }
  }

  async deleteByUserIdAndCustomerId(
    userId: string,
    customerId: string,
  ): Promise<{ deleted: boolean }> {
    const result = await this.relationshipModel
      .deleteOne({ user_id: userId, customer_id: customerId })
      .session(this.transactionContext.getSession() ?? null)
      .exec();

    return { deleted: result.deletedCount === 1 };
  }

  private isDuplicateRelationshipError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 11000
    );
  }
}
