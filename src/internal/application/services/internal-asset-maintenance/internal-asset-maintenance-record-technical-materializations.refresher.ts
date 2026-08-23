import { Inject, Injectable } from '@nestjs/common';

import { InternalAssetMaintenanceRecord } from '@domain/entities';
import {
  IInternalAssetMaintenanceRecordReadRepository,
  IInternalAssetMaintenanceRecordReadRepositoryToken,
  IInternalAssetMaintenanceRecordWriteRepository,
  IInternalAssetMaintenanceRecordWriteRepositoryToken,
} from '@domain/ports/repositories';
import { InternalAssetNotificationMaterializationRefresher } from './internal-asset-notification-materialization.refresher';
import { InternalAssetStatusMaterializationRefresher } from './internal-asset-status-materialization.refresher';

const REFRESH_BATCH_SIZE = 100;

export interface RefreshInternalAssetMaintenanceRecordMaterializationsInput {
  records: InternalAssetMaintenanceRecord[];
  refreshExpirationStatus: boolean;
  refreshExpirationNotification: boolean;
}

export interface RefreshOperationalInternalAssetMaintenanceRecordMaterializationsInput {
  expirationStatusPolicyId?: string | null;
  expirationNotificationPolicyId?: string | null;
  refreshExpirationStatus: boolean;
  refreshExpirationNotification: boolean;
}

export class InternalAssetMaintenanceRecordMaterializationsRefreshError extends Error {
  constructor(
    public readonly recordId: string,
    public readonly stage: 'system_managed_fields_write',
    message: string,
  ) {
    super(message);
  }
}

@Injectable()
export class InternalAssetMaintenanceRecordTechnicalMaterializationsRefresher {
  constructor(
    @Inject(IInternalAssetMaintenanceRecordReadRepositoryToken)
    private readonly readRepository: IInternalAssetMaintenanceRecordReadRepository,
    @Inject(IInternalAssetMaintenanceRecordWriteRepositoryToken)
    private readonly writeRepository: IInternalAssetMaintenanceRecordWriteRepository,
    private readonly statusMaterializationRefresher: InternalAssetStatusMaterializationRefresher,
    private readonly notificationMaterializationRefresher: InternalAssetNotificationMaterializationRefresher,
  ) {}

  async refresh(
    input: RefreshInternalAssetMaintenanceRecordMaterializationsInput,
  ): Promise<void> {
    if (input.records.length === 0) {
      return;
    }

    const policiesById = await this.readRepository.findPoliciesByIds({
      expirationStatusPolicyIds: input.refreshExpirationStatus
        ? this.collectPolicyIds(input.records, 'status')
        : [],
      expirationNotificationPolicyIds: input.refreshExpirationNotification
        ? this.collectPolicyIds(input.records, 'notification')
        : [],
    });

    for (const record of input.records) {
      try {
        await this.writeRepository.updateSystemManagedFields({
          recordId: record.id,
          ...(input.refreshExpirationStatus
            ? {
                expirationStatusMaterialization:
                  this.statusMaterializationRefresher.refresh({
                    record,
                    policy: record.expirationStatusPolicyId
                      ? (policiesById.expirationStatusPoliciesById.get(
                          record.expirationStatusPolicyId,
                        ) ?? null)
                      : null,
                  }),
              }
            : {}),
          ...(input.refreshExpirationNotification
            ? {
                expirationNotificationMaterialization:
                  this.notificationMaterializationRefresher.refresh({
                    record,
                    policy: record.expirationNotificationPolicyId
                      ? (policiesById.expirationNotificationPoliciesById.get(
                          record.expirationNotificationPolicyId,
                        ) ?? null)
                      : null,
                  }),
              }
            : {}),
        });
      } catch (error) {
        throw new InternalAssetMaintenanceRecordMaterializationsRefreshError(
          record.id,
          'system_managed_fields_write',
          error instanceof Error ? error.message : String(error),
        );
      }
    }
  }

  async refreshOperational(
    input: RefreshOperationalInternalAssetMaintenanceRecordMaterializationsInput,
  ): Promise<void> {
    let after: { createdAt: Date; recordId: string } | undefined;

    do {
      const { data: records } = await this.readRepository.findOperational({
        after,
        limit: REFRESH_BATCH_SIZE,
        expirationStatusPolicyId: input.expirationStatusPolicyId,
        expirationNotificationPolicyId: input.expirationNotificationPolicyId,
      });

      await this.refresh({
        records,
        refreshExpirationStatus: input.refreshExpirationStatus,
        refreshExpirationNotification: input.refreshExpirationNotification,
      });

      const lastRecord = records.at(-1);
      after = lastRecord
        ? {
            createdAt: this.requireCreatedAt(lastRecord),
            recordId: lastRecord.id,
          }
        : undefined;

      if (records.length < REFRESH_BATCH_SIZE) {
        return;
      }
    } while (after);
  }

  private collectPolicyIds(
    records: InternalAssetMaintenanceRecord[],
    type: 'status' | 'notification',
  ): string[] {
    return Array.from(
      new Set(
        records
          .map((record) =>
            type === 'status'
              ? record.expirationStatusPolicyId
              : record.expirationNotificationPolicyId,
          )
          .filter((policyId): policyId is string => Boolean(policyId)),
      ),
    );
  }

  private requireCreatedAt(record: InternalAssetMaintenanceRecord): Date {
    if (!record.createdAt) {
      throw new Error(
        `Internal asset maintenance record ${record.id} is missing createdAt`,
      );
    }

    return record.createdAt;
  }
}
