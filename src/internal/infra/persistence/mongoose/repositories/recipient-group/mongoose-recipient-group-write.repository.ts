import { Injectable } from '@nestjs/common';

import { RecipientGroup } from '@domain/entities';
import { IRecipientGroupWriteRepository } from '@domain/ports/repositories';
import { MongooseRecipientGroupBaseRepository } from './mongoose-recipient-group-base.repository';

@Injectable()
export class MongooseRecipientGroupWriteRepositoryImpl
  extends MongooseRecipientGroupBaseRepository
  implements IRecipientGroupWriteRepository
{
  async create(
    recipientGroup: RecipientGroup,
  ): Promise<{ data: RecipientGroup | null }> {
    const data = this.toMongoose(recipientGroup);
    const entity = new this.recipientGroupModel({
      recipient_group_id: recipientGroup.id,
      ...data,
    });
    await entity.save();

    return {
      data: this.toDomain(entity),
    };
  }

  async update(
    recipientGroup: RecipientGroup,
  ): Promise<{ data: RecipientGroup | null }> {
    const data = this.toMongoose(recipientGroup);

    const updated = await this.recipientGroupModel
      .findOneAndUpdate({ recipient_group_id: recipientGroup.id }, data, {
        new: true,
      })
      .exec();

    return {
      data: this.toDomain(updated),
    };
  }
}
