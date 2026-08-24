import { Injectable } from '@nestjs/common';

import { InternalAssetMaintenanceRecord } from '@domain/entities';
import {
  IInternalAssetMaintenanceRecordWriteRepository,
  UpdateInternalAssetMaintenanceRecordSystemManagedFieldsParams,
} from '@domain/ports/repositories';
import { MongooseInternalAssetMaintenanceRecordMapper } from '@infra/persistence/mongoose/mappers/internal-asset-maintenance-record';
import { MongooseInternalAssetMaintenanceRecordBaseRepository } from './mongoose-internal-asset-maintenance-record-base.repository';

@Injectable()
export class MongooseInternalAssetMaintenanceRecordWriteRepositoryImpl
  extends MongooseInternalAssetMaintenanceRecordBaseRepository
  implements IInternalAssetMaintenanceRecordWriteRepository
{
  async create(
    record: InternalAssetMaintenanceRecord,
  ): Promise<{ data: InternalAssetMaintenanceRecord | null }> {
    const data = this.toMongoose(record);
    const entity = new this.internalAssetMaintenanceRecordModel({
      internal_asset_maintenance_record_id: record.id,
      ...data,
    });
    await entity.save();

    return {
      data: this.toDomain(entity),
    };
  }

  async update(
    record: InternalAssetMaintenanceRecord,
  ): Promise<{ data: InternalAssetMaintenanceRecord | null }> {
    const data = this.toMongoose(record);

    const updated = await this.internalAssetMaintenanceRecordModel
      .findOneAndUpdate(
        { internal_asset_maintenance_record_id: record.id },
        data,
        { new: true },
      )
      .exec();

    return {
      data: this.toDomain(updated),
    };
  }

  async updateSystemManagedFields(
    params: UpdateInternalAssetMaintenanceRecordSystemManagedFieldsParams,
  ): Promise<{ updated: boolean }> {
    const fields = this.toSystemManagedFields(params);

    // Bypass Mongoose update middleware so technical writes cannot change updatedAt.
    const result =
      await this.internalAssetMaintenanceRecordModel.collection.updateOne(
        { internal_asset_maintenance_record_id: params.recordId },
        { $set: fields },
      );

    return { updated: result.matchedCount > 0 };
  }

  private toSystemManagedFields(
    params: UpdateInternalAssetMaintenanceRecordSystemManagedFieldsParams,
  ): Record<string, unknown> {
    const fields: Record<string, unknown> = {};

    if (params.expirationStatusPolicyId !== undefined) {
      fields.expiration_status_policy_id = params.expirationStatusPolicyId;
    }

    if (params.expirationNotificationPolicyId !== undefined) {
      fields.expiration_notification_policy_id =
        params.expirationNotificationPolicyId;
    }

    if (params.expirationStatusMaterialization !== undefined) {
      fields.expiration_status_materialization =
        MongooseInternalAssetMaintenanceRecordMapper.toMongooseExpirationStatusMaterialization(
          params.expirationStatusMaterialization,
        );
    }

    if (params.expirationNotificationMaterialization !== undefined) {
      fields.expiration_notification_materialization =
        MongooseInternalAssetMaintenanceRecordMapper.toMongooseExpirationNotificationMaterialization(
          params.expirationNotificationMaterialization,
        );
    }

    if (Object.keys(fields).length === 0) {
      throw new Error('At least one system-managed field is required');
    }

    return fields;
  }
}
