import { Injectable } from '@nestjs/common';

import { InternalAssetMaintenanceRecord } from '@domain/entities';
import { IInternalAssetMaintenanceRecordWriteRepository } from '@domain/ports/repositories';
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
}
