import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  ExpirationNotificationPolicy,
  ExpirationStatusPolicy,
  InternalAssetMaintenanceRecord,
} from '@domain/entities';
import { MongooseExpirationNotificationPolicyMapper } from '@infra/persistence/mongoose/mappers/expiration-notification-policy';
import { MongooseExpirationStatusPolicyMapper } from '@infra/persistence/mongoose/mappers/expiration-status-policy';
import { MongooseInternalAssetMaintenanceRecordMapper } from '@infra/persistence/mongoose/mappers/internal-asset-maintenance-record';
import {
  ExpirationNotificationPolicyDocument,
  ExpirationStatusPolicyDocument,
  InternalAssetMaintenanceRecordDocument,
} from '@infra/persistence/mongoose/schemas';

@Injectable()
export class MongooseInternalAssetMaintenanceRecordBaseRepository {
  constructor(
    @InjectModel(InternalAssetMaintenanceRecordDocument.name)
    protected readonly internalAssetMaintenanceRecordModel: Model<InternalAssetMaintenanceRecordDocument>,
    @InjectModel(ExpirationStatusPolicyDocument.name)
    protected readonly expirationStatusPolicyModel: Model<ExpirationStatusPolicyDocument>,
    @InjectModel(ExpirationNotificationPolicyDocument.name)
    protected readonly expirationNotificationPolicyModel: Model<ExpirationNotificationPolicyDocument>,
  ) {}

  protected toDomain(
    document: InternalAssetMaintenanceRecordDocument | null,
  ): InternalAssetMaintenanceRecord | null {
    return MongooseInternalAssetMaintenanceRecordMapper.toDomain(document);
  }

  protected toMongoose(record: InternalAssetMaintenanceRecord) {
    return MongooseInternalAssetMaintenanceRecordMapper.toMongoose(record);
  }

  protected toExpirationStatusPolicyDomain(
    document: ExpirationStatusPolicyDocument | null,
  ): ExpirationStatusPolicy | null {
    return MongooseExpirationStatusPolicyMapper.toDomain(document);
  }

  protected toExpirationNotificationPolicyDomain(
    document: ExpirationNotificationPolicyDocument | null,
  ): ExpirationNotificationPolicy | null {
    return MongooseExpirationNotificationPolicyMapper.toDomain(document);
  }
}
