import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { ExpirationStatusPolicy } from '@domain/entities';
import { MongooseExpirationStatusPolicyMapper } from '@infra/persistence/mongoose/mappers/expiration-status-policy';
import { ExpirationStatusPolicyDocument } from '@infra/persistence/mongoose/schemas/expiration-status-policy';

@Injectable()
export class MongooseExpirationStatusPolicyBaseRepository {
  constructor(
    @InjectModel(ExpirationStatusPolicyDocument.name)
    protected readonly expirationStatusPolicyModel: Model<ExpirationStatusPolicyDocument>,
  ) {}

  protected toDomain(
    document: ExpirationStatusPolicyDocument | null,
  ): ExpirationStatusPolicy | null {
    return MongooseExpirationStatusPolicyMapper.toDomain(document);
  }

  protected toMongoose(policy: ExpirationStatusPolicy) {
    return MongooseExpirationStatusPolicyMapper.toMongoose(policy);
  }
}
