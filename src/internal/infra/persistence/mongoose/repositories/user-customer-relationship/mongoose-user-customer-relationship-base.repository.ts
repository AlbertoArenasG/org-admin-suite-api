import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UserCustomerRelationship } from '@domain/entities';
import { MongooseUserCustomerRelationshipMapper } from '@infra/persistence/mongoose/mappers';
import { UserCustomerRelationshipDocument } from '@infra/persistence/mongoose/schemas';
import { MongooseTransactionContext } from '@infra/persistence/mongoose/transactions';

@Injectable()
export class MongooseUserCustomerRelationshipBaseRepository {
  constructor(
    @InjectModel(UserCustomerRelationshipDocument.name)
    protected readonly relationshipModel: Model<UserCustomerRelationshipDocument>,
    protected readonly transactionContext: MongooseTransactionContext,
  ) {}

  protected toDomain(
    document: UserCustomerRelationshipDocument,
  ): UserCustomerRelationship | null {
    return MongooseUserCustomerRelationshipMapper.toDomain(document);
  }

  protected toMongoose(relationship: UserCustomerRelationship) {
    return MongooseUserCustomerRelationshipMapper.toMongoose(relationship);
  }
}
