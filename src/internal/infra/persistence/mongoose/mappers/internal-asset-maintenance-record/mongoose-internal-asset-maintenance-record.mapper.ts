import { InternalAssetMaintenanceRecord } from '@domain/entities';
import { InternalAssetMaintenanceRecordDocument } from '@infra/persistence/mongoose/schemas/internal-asset-maintenance-record';

export class MongooseInternalAssetMaintenanceRecordMapper {
  static toDomain(
    document: InternalAssetMaintenanceRecordDocument | null,
  ): InternalAssetMaintenanceRecord | null {
    if (!document) {
      return null;
    }

    return new InternalAssetMaintenanceRecord({
      id: document.internal_asset_maintenance_record_id,
      assetName: document.asset_name,
      assetIdentifier: document.asset_identifier,
      assetMaintenanceType: document.asset_maintenance_type,
      lastMaintenanceAt: document.last_maintenance_at,
      interval: {
        years: document.interval?.years ?? 0,
        months: document.interval?.months ?? 0,
        weeks: document.interval?.weeks ?? 0,
        days: document.interval?.days ?? 0,
      },
      expirationDate: document.expiration_date,
      observations: document.observations ?? null,
      status: document.status,
      expirationStatusPolicyId: document.expiration_status_policy_id ?? null,
      expirationNotificationPolicyId:
        document.expiration_notification_policy_id ?? null,
      provider: document.provider
        ? {
            sentToProvider: document.provider.sent_to_provider,
            providerName: document.provider.provider_name ?? null,
            sentToProviderAt: document.provider.sent_to_provider_at ?? null,
            providerLeadTime: document.provider.provider_lead_time
              ? {
                  years: document.provider.provider_lead_time.years ?? 0,
                  months: document.provider.provider_lead_time.months ?? 0,
                  weeks: document.provider.provider_lead_time.weeks ?? 0,
                  days: document.provider.provider_lead_time.days ?? 0,
                }
              : null,
            providerNotes: document.provider.provider_notes ?? null,
          }
        : null,
      createdBy: document.created_by ?? null,
      updatedBy: document.updated_by ?? null,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    });
  }

  static toMongoose(record: InternalAssetMaintenanceRecord) {
    return {
      asset_name: record.assetName,
      asset_identifier: record.assetIdentifier,
      asset_maintenance_type: record.assetMaintenanceType,
      last_maintenance_at: record.lastMaintenanceAt,
      interval: {
        years: record.interval.years,
        months: record.interval.months,
        weeks: record.interval.weeks,
        days: record.interval.days,
      },
      expiration_date: record.expirationDate,
      observations: record.observations,
      status: record.status,
      expiration_status_policy_id: record.expirationStatusPolicyId,
      expiration_notification_policy_id: record.expirationNotificationPolicyId,
      provider: record.provider
        ? {
            sent_to_provider: record.provider.sentToProvider,
            provider_name: record.provider.providerName,
            sent_to_provider_at: record.provider.sentToProviderAt,
            provider_lead_time: record.provider.providerLeadTime
              ? {
                  years: record.provider.providerLeadTime.years,
                  months: record.provider.providerLeadTime.months,
                  weeks: record.provider.providerLeadTime.weeks,
                  days: record.provider.providerLeadTime.days,
                }
              : null,
            provider_notes: record.provider.providerNotes,
          }
        : null,
      created_by: record.createdBy,
      updated_by: record.updatedBy,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
