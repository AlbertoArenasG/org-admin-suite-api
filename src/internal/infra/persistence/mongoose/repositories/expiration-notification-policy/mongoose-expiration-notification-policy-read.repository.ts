import { Injectable } from '@nestjs/common';

import {
  ExpirationNotificationPolicy,
  ExpirationNotificationPolicyStatus,
} from '@domain/entities';
import {
  FindExpirationNotificationPoliciesParams,
  FindExpirationNotificationPoliciesResult,
  FindExpirationNotificationPolicyOptionsParams,
  IExpirationNotificationPolicyReadRepository,
} from '@domain/ports/repositories';
import { MongooseExpirationNotificationPolicyBaseRepository } from './mongoose-expiration-notification-policy-base.repository';

@Injectable()
export class MongooseExpirationNotificationPolicyReadRepositoryImpl
  extends MongooseExpirationNotificationPolicyBaseRepository
  implements IExpirationNotificationPolicyReadRepository
{
  async findById(
    expirationNotificationPolicyId: string,
  ): Promise<{ data: ExpirationNotificationPolicy | null }> {
    const document = await this.expirationNotificationPolicyModel
      .findOne({
        expiration_notification_policy_id: expirationNotificationPolicyId,
      })
      .exec();

    return { data: this.toDomain(document) };
  }

  async findByName(
    name: string,
  ): Promise<{ data: ExpirationNotificationPolicy | null }> {
    const document = await this.expirationNotificationPolicyModel
      .findOne({ name })
      .exec();

    return { data: this.toDomain(document) };
  }

  async findByCode(
    code: string,
  ): Promise<{ data: ExpirationNotificationPolicy | null }> {
    const document = await this.expirationNotificationPolicyModel
      .findOne({ code })
      .exec();

    return { data: this.toDomain(document) };
  }

  async findAll(
    params: FindExpirationNotificationPoliciesParams,
  ): Promise<FindExpirationNotificationPoliciesResult> {
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
      filter.status = { $ne: ExpirationNotificationPolicyStatus.DELETED };
    }

    const sortCriteria = this.buildSortCriteria(sorts);

    const [documents, total] = await Promise.all([
      this.expirationNotificationPolicyModel
        .find(filter)
        .sort(sortCriteria)
        .skip(skip)
        .limit(perPage)
        .exec(),
      this.expirationNotificationPolicyModel.countDocuments(filter).exec(),
    ]);

    return {
      data: documents
        .map((document) => this.toDomain(document))
        .filter(
          (policy): policy is ExpirationNotificationPolicy => policy !== null,
        ),
      total,
    };
  }

  async findOptions(
    params: FindExpirationNotificationPolicyOptionsParams,
  ): Promise<{ data: ExpirationNotificationPolicy[] }> {
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
      filter.status = ExpirationNotificationPolicyStatus.ACTIVE;
    }

    const documents = await this.expirationNotificationPolicyModel
      .find(filter)
      .sort({ name: 1, createdAt: -1 })
      .exec();

    return {
      data: documents
        .map((document) => this.toDomain(document))
        .filter(
          (policy): policy is ExpirationNotificationPolicy => policy !== null,
        ),
    };
  }

  private buildSortCriteria(
    sorts: FindExpirationNotificationPoliciesParams['sorts'],
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
