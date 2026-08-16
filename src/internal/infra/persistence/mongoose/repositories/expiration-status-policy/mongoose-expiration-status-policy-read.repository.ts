import { Injectable } from '@nestjs/common';

import {
  ExpirationStatusPolicy,
  ExpirationStatusPolicyStatus,
} from '@domain/entities';
import {
  FindExpirationStatusPoliciesParams,
  FindExpirationStatusPoliciesResult,
  FindExpirationStatusPolicyOptionsParams,
  IExpirationStatusPolicyReadRepository,
} from '@domain/ports/repositories';
import { MongooseExpirationStatusPolicyBaseRepository } from './mongoose-expiration-status-policy-base.repository';

@Injectable()
export class MongooseExpirationStatusPolicyReadRepositoryImpl
  extends MongooseExpirationStatusPolicyBaseRepository
  implements IExpirationStatusPolicyReadRepository
{
  async findById(
    expirationStatusPolicyId: string,
  ): Promise<{ data: ExpirationStatusPolicy | null }> {
    const document = await this.expirationStatusPolicyModel
      .findOne({ expiration_status_policy_id: expirationStatusPolicyId })
      .exec();

    return { data: this.toDomain(document) };
  }

  async findByName(
    name: string,
  ): Promise<{ data: ExpirationStatusPolicy | null }> {
    const document = await this.expirationStatusPolicyModel
      .findOne({ name })
      .exec();

    return { data: this.toDomain(document) };
  }

  async findByCode(
    code: string,
  ): Promise<{ data: ExpirationStatusPolicy | null }> {
    const document = await this.expirationStatusPolicyModel
      .findOne({ code })
      .exec();

    return { data: this.toDomain(document) };
  }

  async findAll(
    params: FindExpirationStatusPoliciesParams,
  ): Promise<FindExpirationStatusPoliciesResult> {
    const { page, perPage, search, status, sorts } = params;
    const skip = (page - 1) * perPage;
    const filter: Record<string, unknown> = {};

    if (search && search.trim().length > 0) {
      filter.$or = [
        { name: { $regex: escapeRegex(search), $options: 'i' } },
        { code: { $regex: escapeRegex(search), $options: 'i' } },
        { description: { $regex: escapeRegex(search), $options: 'i' } },
      ];
    }

    if (status) {
      filter.status = status;
    } else {
      filter.status = { $ne: ExpirationStatusPolicyStatus.DELETED };
    }

    const sortCriteria = this.buildSortCriteria(sorts);

    const [documents, total] = await Promise.all([
      this.expirationStatusPolicyModel
        .find(filter)
        .sort(sortCriteria)
        .skip(skip)
        .limit(perPage)
        .exec(),
      this.expirationStatusPolicyModel.countDocuments(filter).exec(),
    ]);

    return {
      data: documents
        .map((document) => this.toDomain(document))
        .filter((policy): policy is ExpirationStatusPolicy => policy !== null),
      total,
    };
  }

  async findOptions(
    params: FindExpirationStatusPolicyOptionsParams,
  ): Promise<{ data: ExpirationStatusPolicy[] }> {
    const filter: Record<string, unknown> = {};

    if (params.search && params.search.trim().length > 0) {
      filter.$or = [
        { name: { $regex: escapeRegex(params.search), $options: 'i' } },
        { code: { $regex: escapeRegex(params.search), $options: 'i' } },
      ];
    }

    if (params.status) {
      filter.status = params.status;
    } else {
      filter.status = ExpirationStatusPolicyStatus.ACTIVE;
    }

    const documents = await this.expirationStatusPolicyModel
      .find(filter)
      .sort({ name: 1, createdAt: -1 })
      .exec();

    return {
      data: documents
        .map((document) => this.toDomain(document))
        .filter((policy): policy is ExpirationStatusPolicy => policy !== null),
    };
  }

  private buildSortCriteria(
    sorts: FindExpirationStatusPoliciesParams['sorts'],
  ): Record<string, 1 | -1> {
    if (!sorts || sorts.length === 0) {
      return { createdAt: -1 };
    }

    const mapping: Record<string, string> = {
      name: 'name',
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
