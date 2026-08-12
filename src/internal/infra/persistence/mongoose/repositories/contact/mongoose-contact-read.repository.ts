import { Injectable } from '@nestjs/common';

import { Contact, ContactStatus } from '@domain/entities';
import {
  ContactTypeFilter,
  FindContactsParams,
  FindContactsResult,
  IContactReadRepository,
} from '@domain/ports/repositories';
import { MongooseContactBaseRepository } from './mongoose-contact-base.repository';

@Injectable()
export class MongooseContactReadRepositoryImpl
  extends MongooseContactBaseRepository
  implements IContactReadRepository
{
  async findById(contactId: string): Promise<{ data: Contact | null }> {
    const document = await this.contactModel
      .findOne({ contact_id: contactId })
      .exec();

    return { data: this.toDomain(document) };
  }

  async findByUserId(userId: string): Promise<{ data: Contact | null }> {
    const document = await this.contactModel
      .findOne({ user_id: userId })
      .exec();

    return { data: this.toDomain(document) };
  }

  async findAll(params: FindContactsParams): Promise<FindContactsResult> {
    const { page, perPage, search, status, type, sorts } = params;
    const skip = (page - 1) * perPage;
    const filter: Record<string, unknown> = {};

    if (search && search.trim().length > 0) {
      filter.$or = [
        { full_name: { $regex: escapeRegex(search), $options: 'i' } },
        { company_name: { $regex: escapeRegex(search), $options: 'i' } },
        { 'emails.value': { $regex: escapeRegex(search), $options: 'i' } },
      ];
    }

    if (status) {
      filter.status = status;
    } else {
      filter.status = { $ne: ContactStatus.DELETED };
    }

    if (type) {
      Object.assign(filter, this.buildTypeFilter(type));
    }

    const sortCriteria = this.buildSortCriteria(sorts);

    const [documents, total] = await Promise.all([
      this.contactModel
        .find(filter)
        .sort(sortCriteria)
        .skip(skip)
        .limit(perPage)
        .exec(),
      this.contactModel.countDocuments(filter).exec(),
    ]);

    return {
      data: documents
        .map((document) => this.toDomain(document))
        .filter((contact): contact is Contact => contact !== null),
      total,
    };
  }

  async search(params: {
    q: string;
    limit: number;
  }): Promise<{ data: Contact[] }> {
    const filter = {
      status: ContactStatus.ACTIVE,
      $or: [
        { full_name: { $regex: escapeRegex(params.q), $options: 'i' } },
        { company_name: { $regex: escapeRegex(params.q), $options: 'i' } },
        { 'emails.value': { $regex: escapeRegex(params.q), $options: 'i' } },
      ],
    };

    const documents = await this.contactModel
      .find(filter)
      .sort({ full_name: 1, createdAt: -1 })
      .limit(params.limit)
      .exec();

    return {
      data: documents
        .map((document) => this.toDomain(document))
        .filter((contact): contact is Contact => contact !== null),
    };
  }

  private buildTypeFilter(type: ContactTypeFilter): Record<string, unknown> {
    if (type === 'INTERNAL') {
      return { user_id: { $ne: null } };
    }

    return { user_id: null };
  }

  private buildSortCriteria(
    sorts: FindContactsParams['sorts'],
  ): Record<string, 1 | -1> {
    if (!sorts || sorts.length === 0) {
      return { createdAt: -1 };
    }

    const mapping: Record<string, string> = {
      name: 'name',
      lastname: 'lastname',
      status: 'status',
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
