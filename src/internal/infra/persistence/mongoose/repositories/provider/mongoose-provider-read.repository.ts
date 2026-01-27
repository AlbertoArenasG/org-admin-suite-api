import { Injectable } from '@nestjs/common';

import { Provider, ProviderStatus } from '@domain/entities';
import {
  FindProvidersParams,
  FindProvidersResult,
  IProviderReadRepository,
} from '@domain/ports/repositories';
import { MongooseProviderBaseRepository } from './mongoose-provider-base.repository';

@Injectable()
export class MongooseProviderReadRepositoryImpl
  extends MongooseProviderBaseRepository
  implements IProviderReadRepository
{
  async findById(id: string): Promise<{ data: Provider | null }> {
    const document = await this.providerModel.findOne({ provider_id: id });

    return {
      data: document ? this.toDomain(document) : null,
    };
  }

  async findByProviderCode(
    providerCode: string,
  ): Promise<{ data: Provider | null }> {
    const document = await this.providerModel.findOne({
      provider_code: providerCode,
    });

    return {
      data: document ? this.toDomain(document) : null,
    };
  }

  async findByAccessToken(
    accessToken: string,
  ): Promise<{ data: Provider | null }> {
    const document = await this.providerModel.findOne({
      access_token: accessToken,
    });

    return {
      data: document ? this.toDomain(document) : null,
    };
  }

  async findAll(params: FindProvidersParams): Promise<FindProvidersResult> {
    const { page, perPage, search, status, sorts } = params;
    const skip = (page - 1) * perPage;

    const statusFilter = status ? { status } : {};
    const searchFilter =
      search && search.trim().length > 0
        ? {
            $or: [
              {
                company_name: { $regex: escapeRegex(search), $options: 'i' },
              },
              {
                provider_code: { $regex: escapeRegex(search), $options: 'i' },
              },
            ],
          }
        : {};

    const filter = {
      status: { $ne: ProviderStatus.DELETED },
      ...statusFilter,
      ...searchFilter,
    };

    const sortCriteria = this.buildSortCriteria(sorts);

    const [documents, total] = await Promise.all([
      this.providerModel
        .find(filter)
        .sort(sortCriteria)
        .skip(skip)
        .limit(perPage)
        .exec(),
      this.providerModel.countDocuments(filter).exec(),
    ]);

    return {
      data: documents.map((document) => this.toDomain(document)),
      total,
    };
  }

  private buildSortCriteria(
    sorts: Array<{
      field: FindProvidersParams['sorts'][number]['field'];
      direction: FindProvidersParams['sorts'][number]['direction'];
    }>,
  ): Record<string, 1 | -1> {
    if (!sorts || sorts.length === 0) {
      return { company_name: 1, createdAt: 1 };
    }

    const criteria: Record<string, 1 | -1> = {};

    for (const sort of sorts) {
      const field = this.mapField(sort.field);
      criteria[field] = sort.direction === 'desc' ? -1 : 1;
    }

    if (!criteria.createdAt) {
      criteria.createdAt = 1;
    }

    return criteria;
  }

  private mapField(
    field: FindProvidersParams['sorts'][number]['field'],
  ): string {
    const mapping: Record<string, string> = {
      company_name: 'company_name',
      provider_code: 'provider_code',
      provider_status: 'status',
      created_at: 'createdAt',
    };

    return mapping[field] ?? 'company_name';
  }
}

function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
