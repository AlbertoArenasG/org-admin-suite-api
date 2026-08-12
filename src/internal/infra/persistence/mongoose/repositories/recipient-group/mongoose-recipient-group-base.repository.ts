import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { RecipientGroup } from '@domain/entities';
import { RecipientGroupDocument } from '@infra/persistence/mongoose/schemas/recipient-group';
import { MongooseRecipientGroupMapper } from '@infra/persistence/mongoose/mappers/recipient-group';

@Injectable()
export class MongooseRecipientGroupBaseRepository {
  constructor(
    @InjectModel(RecipientGroupDocument.name)
    protected readonly recipientGroupModel: Model<RecipientGroupDocument>,
  ) {}

  protected toDomain(
    document: RecipientGroupDocument | null,
  ): RecipientGroup | null {
    return MongooseRecipientGroupMapper.toDomain(document);
  }

  protected toMongoose(recipientGroup: RecipientGroup) {
    return MongooseRecipientGroupMapper.toMongoose(recipientGroup);
  }
}
