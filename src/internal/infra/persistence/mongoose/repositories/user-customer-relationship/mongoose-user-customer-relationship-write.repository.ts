import { Injectable } from '@nestjs/common';

import { IUserCustomerRelationshipWriteRepository } from '@domain/ports/repositories';
import { UserCustomerRelationship } from '@domain/entities';
import { MongooseUserCustomerRelationshipBaseRepository } from './mongoose-user-customer-relationship-base.repository';

@Injectable()
export class MongooseUserCustomerRelationshipWriteRepositoryImpl
  extends MongooseUserCustomerRelationshipBaseRepository
  implements IUserCustomerRelationshipWriteRepository
{
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
}
