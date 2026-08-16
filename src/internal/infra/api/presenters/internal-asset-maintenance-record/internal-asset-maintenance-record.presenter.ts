import { Injectable } from '@nestjs/common';

import {
  InternalAssetMaintenanceRecordCatalogDto,
  InternalAssetMaintenanceRecordListItemDto,
  InternalAssetMaintenanceRecordViewDto,
} from '@application/dto';
import { EnumNameService } from '@infra/i18n/services';

@Injectable()
export class InternalAssetMaintenanceRecordPresenter {
  constructor(private readonly enumNameService: EnumNameService) {}

  toCreateResponse(result: InternalAssetMaintenanceRecordViewDto) {
    return this.toViewResponse(result);
  }

  toUpdateResponse(result: InternalAssetMaintenanceRecordViewDto) {
    return this.toViewResponse(result);
  }

  toViewResponse(result: InternalAssetMaintenanceRecordViewDto) {
    return {
      internal_asset_maintenance_record_id: result.id,
      asset_name: result.assetName,
      asset_identifier: result.assetIdentifier,
      asset_maintenance_type: {
        code: result.assetMaintenanceType,
        name: this.enumNameService.getEnumName(
          `INTERNAL_ASSET_MAINTENANCE_RECORD.TYPE.${result.assetMaintenanceType}`,
        ),
      },
      last_maintenance_at: result.lastMaintenanceAt,
      interval: result.interval,
      expiration_date: result.expirationDate,
      observations: result.observations,
      status_id: result.status,
      status_name: this.enumNameService.getEnumName(
        `INTERNAL_ASSET_MAINTENANCE_RECORD.STATUS.${result.status}`,
      ),
      derived_status: {
        code: result.derivedStatus.code,
        name: this.enumNameService.getEnumName(result.derivedStatus.labelKey),
        name_key: result.derivedStatus.labelKey,
        color_hex: result.derivedStatus.colorHex,
        source: result.derivedStatus.source,
      },
      expiration_status_policy: result.expirationStatusPolicy
        ? {
            expiration_status_policy_id: result.expirationStatusPolicy.id,
            name: result.expirationStatusPolicy.name,
            code: result.expirationStatusPolicy.code,
            status_id: result.expirationStatusPolicy.status,
          }
        : null,
      expiration_notification_policy: result.expirationNotificationPolicy
        ? {
            expiration_notification_policy_id:
              result.expirationNotificationPolicy.id,
            name: result.expirationNotificationPolicy.name,
            code: result.expirationNotificationPolicy.code,
            status_id: result.expirationNotificationPolicy.status,
          }
        : null,
      provider: result.provider
        ? {
            sent_to_provider: result.provider.sentToProvider,
            provider_name: result.provider.providerName,
            sent_to_provider_at: result.provider.sentToProviderAt,
            provider_lead_time: result.provider.providerLeadTime,
            provider_notes: result.provider.providerNotes,
          }
        : null,
      created_by: result.createdBy
        ? {
            user_id: result.createdBy.userId,
            name: result.createdBy.name,
            email: result.createdBy.email,
          }
        : null,
      updated_by: result.updatedBy
        ? {
            user_id: result.updatedBy.userId,
            name: result.updatedBy.name,
            email: result.updatedBy.email,
          }
        : null,
      created_at: result.createdAt,
      updated_at: result.updatedAt ?? null,
    };
  }

  toCollection(results: InternalAssetMaintenanceRecordListItemDto[]) {
    return results.map((result) => ({
      internal_asset_maintenance_record_id: result.id,
      asset_name: result.assetName,
      asset_identifier: result.assetIdentifier,
      asset_maintenance_type: {
        code: result.assetMaintenanceType,
        name: this.enumNameService.getEnumName(
          `INTERNAL_ASSET_MAINTENANCE_RECORD.TYPE.${result.assetMaintenanceType}`,
        ),
      },
      last_maintenance_at: result.lastMaintenanceAt,
      expiration_date: result.expirationDate,
      status_id: result.status,
      status_name: this.enumNameService.getEnumName(
        `INTERNAL_ASSET_MAINTENANCE_RECORD.STATUS.${result.status}`,
      ),
      derived_status: {
        code: result.derivedStatus.code,
        name: this.enumNameService.getEnumName(result.derivedStatus.labelKey),
        name_key: result.derivedStatus.labelKey,
        color_hex: result.derivedStatus.colorHex,
        source: result.derivedStatus.source,
      },
      expiration_status_policy: result.expirationStatusPolicy
        ? {
            expiration_status_policy_id: result.expirationStatusPolicy.id,
            name: result.expirationStatusPolicy.name,
            code: result.expirationStatusPolicy.code,
            status_id: result.expirationStatusPolicy.status,
          }
        : null,
      expiration_notification_policy: result.expirationNotificationPolicy
        ? {
            expiration_notification_policy_id:
              result.expirationNotificationPolicy.id,
            name: result.expirationNotificationPolicy.name,
            code: result.expirationNotificationPolicy.code,
            status_id: result.expirationNotificationPolicy.status,
          }
        : null,
      sent_to_provider: result.sentToProvider,
      provider_name: result.providerName,
      provider_lead_time: result.providerLeadTime,
      created_at: result.createdAt,
      updated_at: result.updatedAt ?? null,
    }));
  }

  toCatalogResponse(result: InternalAssetMaintenanceRecordCatalogDto) {
    return {
      asset_maintenance_types: result.assetMaintenanceTypes.map((item) => ({
        code: item.code,
        name: this.enumNameService.getEnumName(item.nameKey),
        name_key: item.nameKey,
      })),
      statuses: result.statuses.map((item) => ({
        code: item.code,
        name: this.enumNameService.getEnumName(item.nameKey),
        name_key: item.nameKey,
      })),
    };
  }
}
