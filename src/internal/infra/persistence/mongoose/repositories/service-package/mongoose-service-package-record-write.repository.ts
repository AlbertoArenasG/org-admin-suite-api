import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  ServicePackageRecord,
  ServicePackageRecordStatus,
} from '@domain/entities';
import { IServicePackageRecordWriteRepository } from '@domain/ports/repositories';
import { ServicePackageRecordDocument } from '@infra/persistence/mongoose/schemas';
import { MongooseServicePackageRecordMapper } from '@infra/persistence/mongoose/mappers';
import { MongooseTransactionContext } from '@infra/persistence/mongoose/transactions';

@Injectable()
export class MongooseServicePackageRecordWriteRepositoryImpl
  implements IServicePackageRecordWriteRepository
{
  constructor(
    @InjectModel(ServicePackageRecordDocument.name)
    private readonly model: Model<ServicePackageRecordDocument>,
    private readonly transactionContext: MongooseTransactionContext,
  ) {}

  async markConvertedIfAvailable(recordId: string): Promise<boolean> {
    const result = await this.model
      .updateOne(
        {
          service_package_record_id: recordId,
          status: ServicePackageRecordStatus.ACTIVE,
          converted_to_customer_service_records: false,
        },
        { $set: { converted_to_customer_service_records: true } },
        { session: this.transactionContext.getSession() },
      )
      .exec();
    return result.modifiedCount === 1;
  }

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
