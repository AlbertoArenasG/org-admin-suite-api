import {
  AuditUserDto,
  ExpirationNotificationPolicyOptionDto,
  ExpirationStatusPolicyOptionDto,
  InternalAssetMaintenanceRecordCatalogDto,
  InternalAssetMaintenanceRecordListItemDto,
  InternalAssetMaintenanceRecipientGroupSummaryDto,
  InternalAssetMaintenanceRecordViewDto,
} from '@application/dto';
import {
  ExpirationNotificationPolicy,
  ExpirationStatusPolicy,
  InternalAssetMaintenanceRecord,
  RecipientGroup,
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
      providerFollowUpEnabled: record.providerFollowUp?.enabled ?? false,
      providerFollowUpRulesCount: record.providerFollowUp?.rules.length ?? 0,
      providerFollowUpLastSentAt: record.providerFollowUp?.lastSentAt ?? null,
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
      recipientGroupsById?: Map<string, RecipientGroup>;
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
      providerFollowUp: record.providerFollowUp
        ? {
            enabled: record.providerFollowUp.enabled,
            rules: record.providerFollowUp.rules.map((rule) => ({
              offset: { ...rule.offset },
              recipientGroupIds: [...rule.recipientGroupIds],
              ccRecipientGroupIds: [...rule.ccRecipientGroupIds],
              recipientGroups: rule.recipientGroupIds
                .map((id) => input?.recipientGroupsById?.get(id) ?? null)
                .filter(
                  (recipientGroup): recipientGroup is RecipientGroup =>
                    recipientGroup !== null,
                )
                .map((recipientGroup) =>
                  this.toRecipientGroupSummary(recipientGroup),
                ),
              ccRecipientGroups: rule.ccRecipientGroupIds
                .map((id) => input?.recipientGroupsById?.get(id) ?? null)
                .filter(
                  (recipientGroup): recipientGroup is RecipientGroup =>
                    recipientGroup !== null,
                )
                .map((recipientGroup) =>
                  this.toRecipientGroupSummary(recipientGroup),
                ),
            })),
            lastSentAt: record.providerFollowUp.lastSentAt,
          }
        : null,
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

  private static toRecipientGroupSummary(
    recipientGroup: RecipientGroup,
  ): InternalAssetMaintenanceRecipientGroupSummaryDto {
    return {
      id: recipientGroup.id,
      name: recipientGroup.name,
      code: recipientGroup.code,
      status: recipientGroup.status,
      enabledChannels: recipientGroup.enabledChannels.map((code) => ({ code })),
    };
  }
}
