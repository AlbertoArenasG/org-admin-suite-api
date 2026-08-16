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
      expirationStatusMaterialization:
        document.expiration_status_materialization
          ? {
              source: document.expiration_status_materialization.source,
              code: document.expiration_status_materialization.code,
              effectiveStartDate:
                document.expiration_status_materialization
                  .effective_start_date ?? null,
              label: document.expiration_status_materialization.label,
              labelKey: document.expiration_status_materialization.label_key,
              colorHex: document.expiration_status_materialization.color_hex,
              matchedRule: document.expiration_status_materialization
                .matched_rule
                ? {
                    sourceRuleId:
                      document.expiration_status_materialization.matched_rule
                        .source_rule_id,
                    startOffset: {
                      years:
                        document.expiration_status_materialization.matched_rule
                          .start_offset?.years ?? 0,
                      months:
                        document.expiration_status_materialization.matched_rule
                          .start_offset?.months ?? 0,
                      weeks:
                        document.expiration_status_materialization.matched_rule
                          .start_offset?.weeks ?? 0,
                      days:
                        document.expiration_status_materialization.matched_rule
                          .start_offset?.days ?? 0,
                    },
                  }
                : null,
              lastMaterializedAt:
                document.expiration_status_materialization.last_materialized_at,
            }
          : null,
      expirationNotificationMaterialization:
        document.expiration_notification_materialization
          ? {
              source: document.expiration_notification_materialization.source,
              nextTriggerDate:
                document.expiration_notification_materialization
                  .next_trigger_date ?? null,
              lastTriggeredAt:
                document.expiration_notification_materialization
                  .last_triggered_at ?? null,
              materializedRulesCount:
                document.expiration_notification_materialization
                  .materialized_rules_count ?? 0,
              materializedRules:
                document.expiration_notification_materialization.materialized_rules.map(
                  (rule) => ({
                    sourceRuleId: rule.source_rule_id,
                    anchor: rule.anchor,
                    startOffset: {
                      years: rule.start_offset?.years ?? 0,
                      months: rule.start_offset?.months ?? 0,
                      weeks: rule.start_offset?.weeks ?? 0,
                      days: rule.start_offset?.days ?? 0,
                    },
                    triggerMode: rule.trigger_mode,
                    repeatEvery: rule.repeat_every
                      ? {
                          years: rule.repeat_every.years ?? 0,
                          months: rule.repeat_every.months ?? 0,
                          weeks: rule.repeat_every.weeks ?? 0,
                          days: rule.repeat_every.days ?? 0,
                        }
                      : null,
                    repeatUntil: rule.repeat_until ?? null,
                    repeatFor: rule.repeat_for
                      ? {
                          years: rule.repeat_for.years ?? 0,
                          months: rule.repeat_for.months ?? 0,
                          weeks: rule.repeat_for.weeks ?? 0,
                          days: rule.repeat_for.days ?? 0,
                        }
                      : null,
                    triggerEvents: rule.trigger_events.map((event) => ({
                      triggerDate: event.trigger_date,
                      status: event.status,
                      triggeredAt: event.triggered_at ?? null,
                      failureReason: event.failure_reason ?? null,
                    })),
                    lastTriggeredAt: rule.last_triggered_at ?? null,
                  }),
                ),
              lastMaterializedAt:
                document.expiration_notification_materialization
                  .last_materialized_at,
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
      expiration_status_materialization: record.expirationStatusMaterialization
        ? {
            source: record.expirationStatusMaterialization.source,
            code: record.expirationStatusMaterialization.code,
            effective_start_date:
              record.expirationStatusMaterialization.effectiveStartDate,
            label: record.expirationStatusMaterialization.label,
            label_key: record.expirationStatusMaterialization.labelKey,
            color_hex: record.expirationStatusMaterialization.colorHex,
            matched_rule: record.expirationStatusMaterialization.matchedRule
              ? {
                  source_rule_id:
                    record.expirationStatusMaterialization.matchedRule
                      .sourceRuleId,
                  start_offset: {
                    years:
                      record.expirationStatusMaterialization.matchedRule
                        .startOffset.years,
                    months:
                      record.expirationStatusMaterialization.matchedRule
                        .startOffset.months,
                    weeks:
                      record.expirationStatusMaterialization.matchedRule
                        .startOffset.weeks,
                    days: record.expirationStatusMaterialization.matchedRule
                      .startOffset.days,
                  },
                }
              : null,
            last_materialized_at:
              record.expirationStatusMaterialization.lastMaterializedAt,
          }
        : null,
      expiration_notification_materialization:
        record.expirationNotificationMaterialization
          ? {
              source: record.expirationNotificationMaterialization.source,
              next_trigger_date:
                record.expirationNotificationMaterialization.nextTriggerDate,
              last_triggered_at:
                record.expirationNotificationMaterialization.lastTriggeredAt,
              materialized_rules_count:
                record.expirationNotificationMaterialization
                  .materializedRulesCount,
              materialized_rules:
                record.expirationNotificationMaterialization.materializedRules.map(
                  (rule) => ({
                    source_rule_id: rule.sourceRuleId,
                    anchor: rule.anchor,
                    start_offset: {
                      years: rule.startOffset.years,
                      months: rule.startOffset.months,
                      weeks: rule.startOffset.weeks,
                      days: rule.startOffset.days,
                    },
                    trigger_mode: rule.triggerMode,
                    repeat_every: rule.repeatEvery
                      ? {
                          years: rule.repeatEvery.years,
                          months: rule.repeatEvery.months,
                          weeks: rule.repeatEvery.weeks,
                          days: rule.repeatEvery.days,
                        }
                      : null,
                    repeat_until: rule.repeatUntil,
                    repeat_for: rule.repeatFor
                      ? {
                          years: rule.repeatFor.years,
                          months: rule.repeatFor.months,
                          weeks: rule.repeatFor.weeks,
                          days: rule.repeatFor.days,
                        }
                      : null,
                    trigger_events: rule.triggerEvents.map((event) => ({
                      trigger_date: event.triggerDate,
                      status: event.status,
                      triggered_at: event.triggeredAt,
                      failure_reason: event.failureReason,
                    })),
                    last_triggered_at: rule.lastTriggeredAt,
                  }),
                ),
              last_materialized_at:
                record.expirationNotificationMaterialization.lastMaterializedAt,
            }
          : null,
      created_by: record.createdBy,
      updated_by: record.updatedBy,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
