import { Injectable } from '@nestjs/common';

import {
  ExpirationNotificationPolicy,
  ExpirationStatusPolicy,
  InternalAssetMaintenanceRecord,
  InternalAssetMaintenanceRecordStatus,
} from '@domain/entities';
import {
  FindInternalAssetMaintenanceRecordsParams,
  FindInternalAssetMaintenanceRecordsResult,
  IInternalAssetMaintenanceRecordReadRepository,
  InternalAssetMaintenancePoliciesByIdResult,
} from '@domain/ports/repositories';
import { MongooseInternalAssetMaintenanceRecordBaseRepository } from './mongoose-internal-asset-maintenance-record-base.repository';

@Injectable()
export class MongooseInternalAssetMaintenanceRecordReadRepositoryImpl
  extends MongooseInternalAssetMaintenanceRecordBaseRepository
  implements IInternalAssetMaintenanceRecordReadRepository
{
  async findById(
    recordId: string,
  ): Promise<{ data: InternalAssetMaintenanceRecord | null }> {
    const document = await this.internalAssetMaintenanceRecordModel
      .findOne({ internal_asset_maintenance_record_id: recordId })
      .exec();

    return { data: this.toDomain(document) };
  }

  async findAll(
    params: FindInternalAssetMaintenanceRecordsParams,
  ): Promise<FindInternalAssetMaintenanceRecordsResult> {
    const { page, perPage, search, status, sorts } = params;
    const skip = (page - 1) * perPage;
    const filter: Record<string, unknown> = {};

    if (search && search.trim().length > 0) {
      filter.$or = [
        { asset_name: { $regex: escapeRegex(search), $options: 'i' } },
        { asset_identifier: { $regex: escapeRegex(search), $options: 'i' } },
        { observations: { $regex: escapeRegex(search), $options: 'i' } },
        {
          'provider.provider_name': {
            $regex: escapeRegex(search),
            $options: 'i',
          },
        },
      ];
    }

    if (params.assetMaintenanceType) {
      filter.asset_maintenance_type = params.assetMaintenanceType;
    }

    if (status) {
      filter.status = status;
    } else {
      filter.status = { $ne: InternalAssetMaintenanceRecordStatus.DELETED };
    }

    if (params.expirationStatusPolicyId) {
      filter.expiration_status_policy_id = params.expirationStatusPolicyId;
    }

    if (params.expirationNotificationPolicyId) {
      filter.expiration_notification_policy_id =
        params.expirationNotificationPolicyId;
    }

    if (typeof params.sentToProvider === 'boolean') {
      filter['provider.sent_to_provider'] = params.sentToProvider;
    }

    const sortCriteria = this.buildSortCriteria(sorts);

    const [documents, total] = await Promise.all([
      this.internalAssetMaintenanceRecordModel
        .find(filter)
        .sort(sortCriteria)
        .skip(skip)
        .limit(perPage)
        .exec(),
      this.internalAssetMaintenanceRecordModel.countDocuments(filter).exec(),
    ]);

    return {
      data: documents
        .map((document) => this.toDomain(document))
        .filter(
          (record): record is InternalAssetMaintenanceRecord => record !== null,
        ),
      total,
    };
  }

  async findPoliciesByIds(input: {
    expirationStatusPolicyIds: string[];
    expirationNotificationPolicyIds: string[];
  }): Promise<InternalAssetMaintenancePoliciesByIdResult> {
    const [statusPolicyDocuments, notificationPolicyDocuments] =
      await Promise.all([
        input.expirationStatusPolicyIds.length > 0
          ? this.expirationStatusPolicyModel
              .find({
                expiration_status_policy_id: {
                  $in: input.expirationStatusPolicyIds,
                },
              })
              .exec()
          : Promise.resolve([]),
        input.expirationNotificationPolicyIds.length > 0
          ? this.expirationNotificationPolicyModel
              .find({
                expiration_notification_policy_id: {
                  $in: input.expirationNotificationPolicyIds,
                },
              })
              .exec()
          : Promise.resolve([]),
      ]);

    return {
      expirationStatusPoliciesById: new Map(
        statusPolicyDocuments
          .map((document) => this.toExpirationStatusPolicyDomain(document))
          .filter((policy): policy is ExpirationStatusPolicy => policy !== null)
          .map((policy) => [policy.id, policy]),
      ),
      expirationNotificationPoliciesById: new Map(
        notificationPolicyDocuments
          .map((document) =>
            this.toExpirationNotificationPolicyDomain(document),
          )
          .filter(
            (policy): policy is ExpirationNotificationPolicy => policy !== null,
          )
          .map((policy) => [policy.id, policy]),
      ),
    };
  }

  private buildSortCriteria(
    sorts: FindInternalAssetMaintenanceRecordsParams['sorts'],
  ): Record<string, 1 | -1> {
    if (!sorts || sorts.length === 0) {
      return { createdAt: -1 };
    }

    const mapping: Record<string, string> = {
      asset_name: 'asset_name',
      asset_identifier: 'asset_identifier',
      last_maintenance_at: 'last_maintenance_at',
      expiration_date: 'expiration_date',
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
