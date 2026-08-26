import { Injectable } from '@nestjs/common';

import {
  FindCustomersParams,
  FindCustomersResult,
  ICustomerReadRepository,
} from '@domain/ports/repositories';
import { Customer, CustomerStatus } from '@domain/entities';
import { MongooseCustomerBaseRepository } from './mongoose-customer-base.repository';

@Injectable()
export class MongooseCustomerReadRepositoryImpl
  extends MongooseCustomerBaseRepository
  implements ICustomerReadRepository
{
  async findById(id: string): Promise<{ data: Customer | null }> {
    const document = await this.customerModel
      .findOne({ customer_id: id })
      .session(this.transactionContext.getSession() ?? null)
      .exec();

    return { data: document ? this.toDomain(document) : null };
  }

  async findByIds(ids: string[]): Promise<{ data: Customer[] }> {
    if (ids.length === 0) {
      return { data: [] };
    }

    const documents = await this.customerModel
      .find({ customer_id: { $in: ids } })
      .session(this.transactionContext.getSession() ?? null)
      .exec();

    return {
      data: documents
        .map((document) => this.toDomain(document))
        .filter((customer): customer is Customer => customer !== null),
    };
  }

  async findOptions(): Promise<{ data: Customer[] }> {
    const documents = await this.customerModel
      .find({ status: CustomerStatus.ACTIVE })
      .sort({ company_name: 1, customer_id: 1 })
      .session(this.transactionContext.getSession() ?? null)
      .exec();

    return {
      data: documents
        .map((document) => this.toDomain(document))
        .filter((customer): customer is Customer => customer !== null),
    };
  }

  async findByClientCode(
    clientCode: string,
  ): Promise<{ data: Customer | null }> {
    const document = await this.customerModel
      .findOne({ client_code: clientCode })
      .session(this.transactionContext.getSession() ?? null)
      .exec();

    return { data: document ? this.toDomain(document) : null };
  }

  async findByAccessToken(
    accessToken: string,
  ): Promise<{ data: Customer | null }> {
    const document = await this.customerModel
      .findOne({ access_token: accessToken })
      .session(this.transactionContext.getSession() ?? null)
      .exec();

    return { data: document ? this.toDomain(document) : null };
  }

  async findAll(params: FindCustomersParams): Promise<FindCustomersResult> {
    const { page, perPage, search, status, sorts } = params;
    const skip = (page - 1) * perPage;

    const searchFilter =
      search && search.trim().length > 0
        ? {
            $or: [
              { company_name: { $regex: escapeRegex(search), $options: 'i' } },
              { client_code: { $regex: escapeRegex(search), $options: 'i' } },
            ],
          }
        : {};

    const filter: Record<string, unknown> = {
      ...searchFilter,
    };

    if (status && Object.values(CustomerStatus).includes(status)) {
      filter.status = status;
    } else {
      filter.status = { $ne: CustomerStatus.DELETED };
    }

    const sortCriteria = this.buildSortCriteria(sorts);

    const [documents, total] = await Promise.all([
      this.customerModel
        .find(filter)
        .sort(sortCriteria)
        .skip(skip)
        .limit(perPage)
        .session(this.transactionContext.getSession() ?? null)
        .exec(),
      this.customerModel
        .countDocuments(filter)
        .session(this.transactionContext.getSession() ?? null)
        .exec(),
    ]);

    return {
      data: documents
        .map((document) => this.toDomain(document))
        .filter((customer): customer is Customer => customer !== null),
      total,
    };
  }

  private buildSortCriteria(
    sorts: FindCustomersParams['sorts'],
  ): Record<string, 1 | -1> {
    if (!sorts || sorts.length === 0) {
      return { createdAt: -1 };
    }

    const mapping: Record<string, string> = {
      company_name: 'company_name',
      client_code: 'client_code',
      customer_status: 'status',
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
