import { Injectable } from '@nestjs/common';

import { ExpirationStatusPolicy } from '@domain/entities';
import { IExpirationStatusPolicyWriteRepository } from '@domain/ports/repositories';
import { MongooseExpirationStatusPolicyBaseRepository } from './mongoose-expiration-status-policy-base.repository';

@Injectable()
export class MongooseExpirationStatusPolicyWriteRepositoryImpl
  extends MongooseExpirationStatusPolicyBaseRepository
  implements IExpirationStatusPolicyWriteRepository
{
  async create(
    expirationStatusPolicy: ExpirationStatusPolicy,
  ): Promise<{ data: ExpirationStatusPolicy | null }> {
    const data = this.toMongoose(expirationStatusPolicy);
    const entity = new this.expirationStatusPolicyModel({
      expiration_status_policy_id: expirationStatusPolicy.id,
      ...data,
    });
    await entity.save();

    return { data: this.toDomain(entity) };
  }

  async update(
    expirationStatusPolicy: ExpirationStatusPolicy,
  ): Promise<{ data: ExpirationStatusPolicy | null }> {
    const data = this.toMongoose(expirationStatusPolicy);

    const updated = await this.expirationStatusPolicyModel
      .findOneAndUpdate(
        {
          expiration_status_policy_id: expirationStatusPolicy.id,
        },
        data,
        { new: true },
      )
      .exec();

    return { data: this.toDomain(updated) };
  }
}
