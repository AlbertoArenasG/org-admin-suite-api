import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { ExpirationNotificationPolicy } from '@domain/entities';
import { MongooseExpirationNotificationPolicyMapper } from '@infra/persistence/mongoose/mappers/expiration-notification-policy';
import { ExpirationNotificationPolicyDocument } from '@infra/persistence/mongoose/schemas/expiration-notification-policy';

@Injectable()
export class MongooseExpirationNotificationPolicyBaseRepository {
  constructor(
    @InjectModel(ExpirationNotificationPolicyDocument.name)
    protected readonly expirationNotificationPolicyModel: Model<ExpirationNotificationPolicyDocument>,
  ) {}

  protected toDomain(
    document: ExpirationNotificationPolicyDocument | null,
  ): ExpirationNotificationPolicy | null {
    return MongooseExpirationNotificationPolicyMapper.toDomain(document);
  }

  protected toMongoose(policy: ExpirationNotificationPolicy) {
    return MongooseExpirationNotificationPolicyMapper.toMongoose(policy);
  }
}
