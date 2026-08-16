import { Injectable } from '@nestjs/common';

import { ExpirationNotificationPolicy } from '@domain/entities';
import { IExpirationNotificationPolicyWriteRepository } from '@domain/ports/repositories';
import { MongooseExpirationNotificationPolicyBaseRepository } from './mongoose-expiration-notification-policy-base.repository';

@Injectable()
export class MongooseExpirationNotificationPolicyWriteRepositoryImpl
  extends MongooseExpirationNotificationPolicyBaseRepository
  implements IExpirationNotificationPolicyWriteRepository
{
  async create(
    expirationNotificationPolicy: ExpirationNotificationPolicy,
  ): Promise<{ data: ExpirationNotificationPolicy | null }> {
    const data = this.toMongoose(expirationNotificationPolicy);
    const entity = new this.expirationNotificationPolicyModel({
      expiration_notification_policy_id: expirationNotificationPolicy.id,
      ...data,
    });
    await entity.save();

    return { data: this.toDomain(entity) };
  }

  async update(
    expirationNotificationPolicy: ExpirationNotificationPolicy,
  ): Promise<{ data: ExpirationNotificationPolicy | null }> {
    const data = this.toMongoose(expirationNotificationPolicy);

    const updated = await this.expirationNotificationPolicyModel
      .findOneAndUpdate(
        {
          expiration_notification_policy_id: expirationNotificationPolicy.id,
        },
        data,
        { new: true },
      )
      .exec();

    return { data: this.toDomain(updated) };
  }
}
