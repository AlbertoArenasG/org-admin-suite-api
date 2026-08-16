import {
  AuditUserDto,
  ExpirationNotificationPolicyOptionDto,
  ExpirationStatusPolicyOptionDto,
  InternalAssetMaintenanceRecordCatalogDto,
  InternalAssetMaintenanceRecordListItemDto,
  InternalAssetMaintenanceRecordViewDto,
} from '@application/dto';
import {
  ExpirationNotificationPolicy,
  ExpirationStatusPolicy,
  InternalAssetMaintenanceRecord,
} from '@domain/entities';
import {
  getInternalAssetMaintenanceStatuses,
  getInternalAssetMaintenanceType,
  getInternalAssetMaintenanceTypes,
} from '@application/services/internal-asset-maintenance';

export class InternalAssetMaintenanceRecordMapper {
  static toListItemDto(
    record: InternalAssetMaintenanceRecord,
    expirationStatusPoliciesById?: Map<string, ExpirationStatusPolicy>,
    expirationNotificationPoliciesById?: Map<
      string,
      ExpirationNotificationPolicy
    >,
  ): InternalAssetMaintenanceRecordListItemDto {
    return {
      id: record.id,
      assetName: record.assetName,
      assetIdentifier: record.assetIdentifier,
      assetMaintenanceType: record.assetMaintenanceType,
      lastMaintenanceAt: record.lastMaintenanceAt,
      expirationDate: record.expirationDate,
      status: record.status,
      derivedStatus: this.toDerivedStatusDto(record),
      expirationStatusPolicy: this.toStatusPolicySummary(
        record.expirationStatusPolicyId,
        expirationStatusPoliciesById,
      ),
      expirationNotificationPolicy: this.toNotificationPolicySummary(
        record.expirationNotificationPolicyId,
        expirationNotificationPoliciesById,
      ),
      sentToProvider: record.provider?.sentToProvider ?? false,
      providerName: record.provider?.providerName ?? null,
      providerLeadTime: record.provider?.providerLeadTime ?? null,
      createdAt: record.createdAt ?? new Date(),
      updatedAt: record.updatedAt,
    };
  }

  static toViewDto(
    record: InternalAssetMaintenanceRecord,
    input?: {
      expirationStatusPoliciesById?: Map<string, ExpirationStatusPolicy>;
      expirationNotificationPoliciesById?: Map<
        string,
        ExpirationNotificationPolicy
      >;
      createdBy?: AuditUserDto | null;
      updatedBy?: AuditUserDto | null;
    },
  ): InternalAssetMaintenanceRecordViewDto {
    return {
      id: record.id,
      assetName: record.assetName,
      assetIdentifier: record.assetIdentifier,
      assetMaintenanceType: record.assetMaintenanceType,
      lastMaintenanceAt: record.lastMaintenanceAt,
      interval: record.interval,
      expirationDate: record.expirationDate,
      observations: record.observations,
      status: record.status,
      derivedStatus: this.toDerivedStatusDto(record),
      expirationStatusPolicy: this.toStatusPolicySummary(
        record.expirationStatusPolicyId,
        input?.expirationStatusPoliciesById,
      ),
      expirationNotificationPolicy: this.toNotificationPolicySummary(
        record.expirationNotificationPolicyId,
        input?.expirationNotificationPoliciesById,
      ),
      provider: record.provider,
      createdBy: input?.createdBy ?? null,
      updatedBy: input?.updatedBy ?? null,
      createdAt: record.createdAt ?? new Date(),
      updatedAt: record.updatedAt,
    };
  }

  static toCatalogDto(): InternalAssetMaintenanceRecordCatalogDto {
    return {
      assetMaintenanceTypes: getInternalAssetMaintenanceTypes().map((item) => ({
        code: item.code,
        name: item.code,
        nameKey:
          getInternalAssetMaintenanceType(item.code)?.nameKey ??
          `INTERNAL_ASSET_MAINTENANCE_RECORD.TYPE.${item.code}`,
      })),
      statuses: getInternalAssetMaintenanceStatuses().map((status) => ({
        code: status.code,
        name: status.code,
        nameKey: status.nameKey,
      })),
    };
  }

  private static toStatusPolicySummary(
    policyId: string | null,
    policiesById?: Map<string, ExpirationStatusPolicy>,
  ): ExpirationStatusPolicyOptionDto | null {
    if (!policyId || !policiesById) {
      return null;
    }

    const policy = policiesById.get(policyId);

    if (!policy) {
      return null;
    }

    return {
      id: policy.id,
      name: policy.name,
      code: policy.code,
      status: policy.status,
    };
  }

  private static toNotificationPolicySummary(
    policyId: string | null,
    policiesById?: Map<string, ExpirationNotificationPolicy>,
  ): ExpirationNotificationPolicyOptionDto | null {
    if (!policyId || !policiesById) {
      return null;
    }

    const policy = policiesById.get(policyId);

    if (!policy) {
      return null;
    }

    return {
      id: policy.id,
      name: policy.name,
      code: policy.code,
      status: policy.status,
    };
  }

  private static toDerivedStatusDto(record: InternalAssetMaintenanceRecord) {
    const materialization = record.expirationStatusMaterialization;

    if (!materialization) {
      return {
        code: 'ON_TIME',
        label: 'On time',
        labelKey: 'INTERNAL_ASSET_MAINTENANCE_RECORD.DERIVED_STATUS.ON_TIME',
        colorHex: '#22C55E',
        source: 'SYSTEM' as const,
      };
    }

    return {
      code: materialization.code,
      label: materialization.label,
      labelKey: materialization.labelKey,
      colorHex: materialization.colorHex,
      source: materialization.source,
    };
  }
}
