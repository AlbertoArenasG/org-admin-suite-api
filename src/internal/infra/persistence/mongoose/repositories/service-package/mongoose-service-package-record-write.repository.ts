import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ServicePackageRecord } from '@domain/entities';
import { IServicePackageRecordWriteRepository } from '@domain/ports/repositories';
import { ServicePackageRecordDocument } from '@infra/persistence/mongoose/schemas';
import { MongooseServicePackageRecordMapper } from '@infra/persistence/mongoose/mappers';

@Injectable()
export class MongooseServicePackageRecordWriteRepositoryImpl
  implements IServicePackageRecordWriteRepository
{
  constructor(
    @InjectModel(ServicePackageRecordDocument.name)
    private readonly model: Model<ServicePackageRecordDocument>,
  ) {}

  async create(
    record: ServicePackageRecord,
  ): Promise<{ data: ServicePackageRecord | null }> {
    const data = MongooseServicePackageRecordMapper.toMongoose(record);
    const document = new this.model(data);
    await document.save();

    return {
      data: MongooseServicePackageRecordMapper.toDomain(document),
    };
  }

  async update(
    record: ServicePackageRecord,
  ): Promise<{ data: ServicePackageRecord | null }> {
    const data = MongooseServicePackageRecordMapper.toMongoose(record);
    const document = await this.model
      .findOneAndUpdate({ service_package_record_id: record.id }, data, {
        new: true,
      })
      .exec();

    return {
      data: MongooseServicePackageRecordMapper.toDomain(document ?? null),
    };
  }
}
