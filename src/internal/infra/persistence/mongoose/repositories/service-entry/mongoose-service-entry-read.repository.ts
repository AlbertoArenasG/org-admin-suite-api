import { Injectable } from '@nestjs/common';

import {
  IServiceEntryReadRepository,
  FindServiceEntriesParams,
  FindServiceEntriesResult,
} from '@domain/ports/repositories';
import { ServiceEntry, ServiceEntryStatus } from '@domain/entities';
import { MongooseServiceEntryBaseRepository } from './mongoose-service-entry-base.repository';

@Injectable()
export class MongooseServiceEntryReadRepositoryImpl
  extends MongooseServiceEntryBaseRepository
  implements IServiceEntryReadRepository
{
  async findById(id: string): Promise<{ data: ServiceEntry | null }> {
    const document = await this.serviceEntryModel
      .findOne({ service_entry_id: id })
      .exec();

    return {
      data: document ? this.toDomain(document) : null,
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
              { company_name: { $regex: escapeRegex(search), $options: 'i' } },
              { contact_name: { $regex: escapeRegex(search), $options: 'i' } },
              { contact_email: { $regex: escapeRegex(search), $options: 'i' } },
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
      this.serviceEntryModel
        .find(filter)
        .sort(sortCriteria)
        .skip(skip)
        .limit(perPage)
        .exec(),
      this.serviceEntryModel.countDocuments(filter).exec(),
    ]);

    return {
      data: documents
        .map((document) => this.toDomain(document))
        .filter((entry): entry is ServiceEntry => entry !== null),
      total,
    };
  }

  async findByServiceOrderIdentifier(
    serviceOrderIdentifier: string,
  ): Promise<{ data: ServiceEntry | null }> {
    const document = await this.serviceEntryModel
      .findOne({ service_order_identifier: serviceOrderIdentifier })
      .exec();

    return {
      data: document ? this.toDomain(document) : null,
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
