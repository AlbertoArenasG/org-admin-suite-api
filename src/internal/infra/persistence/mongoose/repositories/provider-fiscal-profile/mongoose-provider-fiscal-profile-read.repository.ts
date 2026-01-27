import { Injectable } from '@nestjs/common';

import { ProviderFiscalProfile } from '@domain/entities';
import {
  FindProviderFiscalProfilesParams,
  FindProviderFiscalProfilesResult,
  IProviderFiscalProfileReadRepository,
} from '@domain/ports/repositories';
import { MongooseProviderFiscalProfileBaseRepository } from './mongoose-provider-fiscal-profile-base.repository';

@Injectable()
export class MongooseProviderFiscalProfileReadRepositoryImpl
  extends MongooseProviderFiscalProfileBaseRepository
  implements IProviderFiscalProfileReadRepository
{
  async findById(id: string): Promise<{ data: ProviderFiscalProfile | null }> {
    const document = await this.profileModel.findOne({
      provider_fiscal_profile_id: id,
    });

    return {
      data: document ? this.toDomain(document) : null,
    };
  }

  async findByProviderId(
    providerId: string,
  ): Promise<{ data: ProviderFiscalProfile | null }> {
    const document = await this.profileModel.findOne({
      provider_id: providerId,
    });

    return {
      data: document ? this.toDomain(document) : null,
    };
  }

  async findAll(
    params: FindProviderFiscalProfilesParams,
  ): Promise<FindProviderFiscalProfilesResult> {
    const { page, perPage, status, sorts } = params;
    const skip = (page - 1) * perPage;

    const statusFilter = status ? { status } : {};

    const filter = {
      ...statusFilter,
    };

    const sortCriteria = this.buildSortCriteria(sorts);

    const [documents, total] = await Promise.all([
      this.profileModel
        .find(filter)
        .sort(sortCriteria)
        .skip(skip)
        .limit(perPage)
        .exec(),
      this.profileModel.countDocuments(filter).exec(),
    ]);

    return {
      data: documents.map((document) => this.toDomain(document)),
      total,
    };
  }

  private buildSortCriteria(
    sorts: Array<{
      field: FindProviderFiscalProfilesParams['sorts'][number]['field'];
      direction: FindProviderFiscalProfilesParams['sorts'][number]['direction'];
    }>,
  ): Record<string, 1 | -1> {
    if (!sorts || sorts.length === 0) {
      return { createdAt: -1 };
    }

    const criteria: Record<string, 1 | -1> = {};

    for (const sort of sorts) {
      const field = this.mapField(sort.field);
      criteria[field] = sort.direction === 'desc' ? -1 : 1;
    }

    if (!criteria.createdAt) {
      criteria.createdAt = -1;
    }

    return criteria;
  }

  private mapField(
    field: FindProviderFiscalProfilesParams['sorts'][number]['field'],
  ): string {
    const mapping: Record<string, string> = {
      business_name: 'form_data.business_name',
      status: 'status',
      submitted_at: 'submitted_at',
      created_at: 'createdAt',
    };

    return mapping[field] ?? 'createdAt';
  }
}
