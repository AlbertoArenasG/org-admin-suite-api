import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ServiceEntry, ServiceEntryStatus } from '@domain/entities';
import {
  FindServiceEntriesParams,
  FindServiceEntriesResult,
  IServiceEntryRepository,
} from '@domain/ports/repositories';
import { ServiceEntryDocument } from '@infra/persistence/mongoose/schemas';
import { MongooseServiceEntryMapper } from '@infra/persistence/mongoose/mappers';

@Injectable()
export class MongooseServiceEntryRepositoryImpl
  implements IServiceEntryRepository
{
  constructor(
    @InjectModel(ServiceEntryDocument.name)
    private readonly model: Model<ServiceEntryDocument>,
  ) {}

  async create(entry: ServiceEntry): Promise<{ data: ServiceEntry | null }> {
    const data = MongooseServiceEntryMapper.toMongoose(entry);
    const document = new this.model(data);
    await document.save();

    return {
      data: MongooseServiceEntryMapper.toDomain(document),
    };
  }

  async update(entry: ServiceEntry): Promise<{ data: ServiceEntry | null }> {
    const data = MongooseServiceEntryMapper.toMongoose(entry);

    const document = await this.model
      .findOneAndUpdate({ service_entry_id: entry.id }, data, { new: true })
      .exec();

    return {
      data: document ? MongooseServiceEntryMapper.toDomain(document) : null,
    };
  }

  async findById(id: string): Promise<{ data: ServiceEntry | null }> {
    const document = await this.model.findOne({ service_entry_id: id }).exec();

    return {
      data: document ? MongooseServiceEntryMapper.toDomain(document) : null,
    };
  }

  async findAll(
    params: FindServiceEntriesParams,
  ): Promise<FindServiceEntriesResult> {
    const { page, perPage, search, sorts } = params;
    const skip = (page - 1) * perPage;

    const searchFilter =
      search && search.trim().length > 0
        ? {
            $or: [
              {
                company_name: {
                  $regex: escapeRegex(search),
                  $options: 'i',
                },
              },
              {
                contact_name: {
                  $regex: escapeRegex(search),
                  $options: 'i',
                },
              },
              {
                contact_email: {
                  $regex: escapeRegex(search),
                  $options: 'i',
                },
              },
              {
                service_order_identifier: {
                  $regex: escapeRegex(search),
                  $options: 'i',
                },
              },
            ],
          }
        : {};

    const filter = {
      status: { $ne: ServiceEntryStatus.DELETED },
      ...searchFilter,
    };

    const sortCriteria = this.buildSortCriteria(sorts);

    const [documents, total] = await Promise.all([
      this.model
        .find(filter)
        .sort(sortCriteria)
        .skip(skip)
        .limit(perPage)
        .exec(),
      this.model.countDocuments(filter).exec(),
    ]);

    return {
      data: documents.map((document) =>
        MongooseServiceEntryMapper.toDomain(document),
      ),
      total,
    };
  }

  async findByServiceOrderIdentifier(
    serviceOrderIdentifier: string,
  ): Promise<{ data: ServiceEntry | null }> {
    const document = await this.model
      .findOne({ service_order_identifier: serviceOrderIdentifier })
      .exec();

    return {
      data: document ? MongooseServiceEntryMapper.toDomain(document) : null,
    };
  }

  private buildSortCriteria(
    sorts: FindServiceEntriesParams['sorts'],
  ): Record<string, 1 | -1> {
    if (!sorts || sorts.length === 0) {
      return { createdAt: -1 };
    }

    const mapping: Record<string, string> = {
      company_name: 'company_name',
      contact_name: 'contact_name',
      contact_email: 'contact_email',
      service_order_identifier: 'service_order_identifier',
      created_at: 'createdAt',
    };

    const criteria: Record<string, 1 | -1> = {};

    for (const sort of sorts) {
      const field = mapping[sort.field] ?? 'createdAt';
      criteria[field] = sort.direction === 'desc' ? -1 : 1;
    }

    if (!criteria.createdAt) {
      criteria.createdAt = -1;
    }

    return criteria;
  }
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
