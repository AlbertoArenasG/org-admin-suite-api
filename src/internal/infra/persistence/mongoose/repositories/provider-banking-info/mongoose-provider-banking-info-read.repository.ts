import { Injectable } from '@nestjs/common';

import { ProviderBankingInfo } from '@domain/entities';
import {
  FindProviderBankingInfosParams,
  FindProviderBankingInfosResult,
  IProviderBankingInfoReadRepository,
} from '@domain/ports/repositories';
import { MongooseProviderBankingInfoBaseRepository } from './mongoose-provider-banking-info-base.repository';

@Injectable()
export class MongooseProviderBankingInfoReadRepositoryImpl
  extends MongooseProviderBankingInfoBaseRepository
  implements IProviderBankingInfoReadRepository
{
  async findById(id: string): Promise<{ data: ProviderBankingInfo | null }> {
    const document = await this.bankingInfoModel.findOne({
      provider_banking_info_id: id,
    });

    return {
      data: document ? this.toDomain(document) : null,
    };
  }

  async findByProviderId(
    providerId: string,
  ): Promise<{ data: ProviderBankingInfo | null }> {
    const document = await this.bankingInfoModel.findOne({
      provider_id: providerId,
    });

    return {
      data: document ? this.toDomain(document) : null,
    };
  }

  async findAll(
    params: FindProviderBankingInfosParams,
  ): Promise<FindProviderBankingInfosResult> {
    const { page, perPage, status, sorts } = params;
    const skip = (page - 1) * perPage;

    const statusFilter = status ? { status } : {};

    const filter = {
      ...statusFilter,
    };

    const sortCriteria = this.buildSortCriteria(sorts);

    const [documents, total] = await Promise.all([
      this.bankingInfoModel
        .find(filter)
        .sort(sortCriteria)
        .skip(skip)
        .limit(perPage)
        .exec(),
      this.bankingInfoModel.countDocuments(filter).exec(),
    ]);

    return {
      data: documents.map((document) => this.toDomain(document)),
      total,
    };
  }

  private buildSortCriteria(
    sorts: Array<{
      field: FindProviderBankingInfosParams['sorts'][number]['field'];
      direction: FindProviderBankingInfosParams['sorts'][number]['direction'];
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
    field: FindProviderBankingInfosParams['sorts'][number]['field'],
  ): string {
    const mapping: Record<string, string> = {
      beneficiary: 'form_data.beneficiary',
      status: 'status',
      submitted_at: 'submitted_at',
      created_at: 'createdAt',
    };

    return mapping[field] ?? 'createdAt';
  }
}
