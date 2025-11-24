import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  ServicePackageRecord,
  ServicePackageRecordStatus,
} from '@domain/entities';
import {
  FindServicePackageRecordsParams,
  FindServicePackageRecordsResult,
  IServicePackageRecordReadRepository,
} from '@domain/ports/repositories';
import { ServicePackageRecordDocument } from '@infra/persistence/mongoose/schemas';
import { MongooseServicePackageRecordMapper } from '@infra/persistence/mongoose/mappers';

@Injectable()
export class MongooseServicePackageRecordReadRepositoryImpl
  implements IServicePackageRecordReadRepository
{
  constructor(
    @InjectModel(ServicePackageRecordDocument.name)
    private readonly model: Model<ServicePackageRecordDocument>,
  ) {}

  async findAll(
    params: FindServicePackageRecordsParams,
  ): Promise<FindServicePackageRecordsResult> {
    const { page, perPage, packageId, search } = params;
    const skip = (page - 1) * perPage;

    const filter: Record<string, unknown> = {
      status: { $ne: ServicePackageRecordStatus.DELETED },
    };

    if (packageId) {
      filter.package_id = packageId;
    }

    if (search && search.trim().length > 0) {
      const regex = new RegExp(escapeRegex(search.trim()), 'i');
      filter.$or = [
        { service_order: regex },
        { company: regex },
        { collector_name: regex },
        { contact_person: regex },
        { email: regex },
      ];
    }

    const [documents, total] = await Promise.all([
      this.model
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perPage)
        .exec(),
      this.model.countDocuments(filter).exec(),
    ]);

    return {
      data: documents
        .map((doc) => MongooseServicePackageRecordMapper.toDomain(doc))
        .filter((record): record is ServicePackageRecord => !!record),
      total,
    };
  }

  async findById(
    recordId: string,
  ): Promise<{ data: ServicePackageRecord | null }> {
    const document = await this.model
      .findOne({ service_package_record_id: recordId })
      .exec();

    return {
      data: MongooseServicePackageRecordMapper.toDomain(document ?? null),
    };
  }
}

function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
