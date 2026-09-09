import {
  CustomerServiceRecord,
  CustomerServiceRecordNotificationMaterializationProps,
  CustomerServiceRecordStatusMaterializationProps,
} from '@domain/entities';
import { CustomerServiceRecordDocument } from '@infra/persistence/mongoose/schemas';

export class MongooseCustomerServiceRecordMapper {
  static toDomain(
    document: CustomerServiceRecordDocument | null,
  ): CustomerServiceRecord | null {
    if (!document) return null;
    const value = document as any;
    return new CustomerServiceRecord({
      id: value.customer_service_record_id,
      serviceNumber: value.service_number,
      serviceTypeCode: value.service_type_code,
      serviceTypeName: value.service_type_name,
      requestedAt: value.requested_at,
      observations: value.observations ?? null,
      customer: {
        customerId: value.customer.customer_id,
        customerName: value.customer.customer_name,
        users: (value.customer.users ?? []).map((user: any) => ({
          userId: user.user_id,
          name: user.name,
          email: user.email,
        })),
      },
      assets: (value.assets ?? []).map((asset: any) => ({
        assetId: asset.asset_id,
        name: asset.name,
        identifier: asset.identifier,
        brand: asset.brand,
        model: asset.model,
        serialNumber: asset.serial_number,
        observations: asset.observations ?? null,
      })),
      customerDelivery: this.toCustomerDelivery(value.customer_delivery),
      provider: value.provider ? this.toProvider(value.provider) : null,
      status: value.status,
      operationalStatus: value.operational_status,
      createdBy: value.created_by ?? null,
      updatedBy: value.updated_by ?? null,
      createdAt: value.createdAt,
      updatedAt: value.updatedAt,
    });
  }

  static toMongoose(record: CustomerServiceRecord): Record<string, unknown> {
    const value = record.currentState;
    return {
      service_number: record.serviceNumber,
      service_number_display: record.serviceNumberDisplay,
      service_type_code: record.serviceTypeCode,
      service_type_name: record.serviceTypeName,
      requested_at: record.requestedAt,
      observations: record.observations,
      customer: {
        customer_id: record.customer.customerId,
        customer_name: record.customer.customerName,
        users: record.customer.users.map((user) => ({
          user_id: user.userId,
          name: user.name,
          email: user.email,
        })),
      },
      assets: record.assets.map((asset) => ({
        asset_id: asset.assetId,
        name: asset.name,
        identifier: asset.identifier,
        brand: asset.brand,
        model: asset.model,
        serial_number: asset.serialNumber,
        observations: asset.observations,
      })),
      customer_delivery: this.toMongooseCustomerDelivery(
        record.customerDelivery,
      ),
      provider: record.provider
        ? this.toMongooseProvider(record.provider)
        : null,
      status: record.status,
      operational_status: record.operationalStatus,
      created_by: record.createdBy,
      updated_by: record.updatedBy,
      createdAt: value.createdAt,
      updatedAt: value.updatedAt,
    };
  }

  static toMongooseStatusMaterialization(
    materialization: CustomerServiceRecordStatusMaterializationProps | null,
  ) {
    if (!materialization) return null;
    return {
      source: materialization.source,
      code: materialization.code,
      effective_start_date: materialization.effectiveStartDate,
      label: materialization.label,
      label_key: materialization.labelKey,
      color_hex: materialization.colorHex,
      matched_rule: materialization.matchedRule
        ? {
            source_rule_id: materialization.matchedRule.sourceRuleId,
            start_offset: this.toMongooseInterval(
              materialization.matchedRule.startOffset,
            ),
          }
        : null,
      last_materialized_at: materialization.lastMaterializedAt,
    };
  }

  static toMongooseNotificationMaterialization(
    materialization: CustomerServiceRecordNotificationMaterializationProps | null,
  ) {
    if (!materialization) return null;
    return {
      source: materialization.source,
      next_trigger_date: materialization.nextTriggerDate,
      last_triggered_at: materialization.lastTriggeredAt,
      materialized_rules_count: materialization.materializedRulesCount,
      materialized_rules: materialization.materializedRules.map((rule) => ({
        source_rule_id: rule.sourceRuleId,
        anchor: rule.anchor,
        start_offset: this.toMongooseInterval(rule.startOffset),
        trigger_mode: rule.triggerMode,
        repeat_every: rule.repeatEvery
          ? this.toMongooseInterval(rule.repeatEvery)
          : null,
        repeat_until: rule.repeatUntil,
        repeat_for: rule.repeatFor
          ? this.toMongooseInterval(rule.repeatFor)
          : null,
        trigger_events: rule.triggerEvents.map((event) => ({
          trigger_date: event.triggerDate,
          status: event.status,
          triggered_at: event.triggeredAt,
          failure_reason: event.failureReason,
        })),
        last_triggered_at: rule.lastTriggeredAt,
      })),
      last_materialized_at: materialization.lastMaterializedAt,
    };
  }

  private static toCustomerDelivery(value: any) {
    return {
      receivedAt: value.received_at ?? null,
      estimatedDeliveryInterval: this.toInterval(
        value.estimated_delivery_interval,
      ),
      estimatedDeliveryAt: value.estimated_delivery_at ?? null,
      deliveredToCustomerAt: value.delivered_to_customer_at ?? null,
      statusPolicyId: value.status_policy_id ?? null,
      notificationPolicyId: value.notification_policy_id ?? null,
      statusMaterialization: this.toStatusMaterialization(
        value.status_materialization,
      ),
      notificationMaterialization: this.toNotificationMaterialization(
        value.notification_materialization,
      ),
    };
  }

  private static toProvider(value: any) {
    return {
      providerId: value.provider_id,
      providerName: value.provider_name,
      deliveredToProviderAt: value.delivered_to_provider_at ?? null,
      estimatedReturnInterval: this.toInterval(value.estimated_return_interval),
      estimatedReturnAt: value.estimated_return_at ?? null,
      returnedFromProviderAt: value.returned_from_provider_at ?? null,
      statusPolicyId: value.status_policy_id ?? null,
      notificationPolicyId: value.notification_policy_id ?? null,
      followUp: {
        enabled: value.follow_up?.enabled ?? false,
        rules: (value.follow_up?.rules ?? []).map((rule: any) => ({
          ruleId: rule.rule_id,
          interval: this.toInterval(rule.interval),
          recipientGroupIds: rule.recipient_group_ids ?? [],
          ccRecipientGroupIds: rule.cc_recipient_group_ids ?? [],
        })),
      },
      statusMaterialization: this.toStatusMaterialization(
        value.status_materialization,
      ),
      notificationMaterialization: this.toNotificationMaterialization(
        value.notification_materialization,
      ),
      followUpMaterialization: (value.follow_up_materialization ?? []).map(
        (item: any) => ({
          source: item.source,
          sourceRuleId: item.source_rule_id,
          triggerDate: item.trigger_date,
          status: item.status,
          triggeredAt: item.triggered_at ?? null,
          failureReason: item.failure_reason ?? null,
          lastMaterializedAt: item.last_materialized_at,
        }),
      ),
    };
  }

  private static toStatusMaterialization(value: any) {
    if (!value) return null;
    return {
      source: value.source,
      code: value.code,
      effectiveStartDate: value.effective_start_date ?? null,
      label: value.label,
      labelKey: value.label_key ?? null,
      colorHex: value.color_hex,
      matchedRule: value.matched_rule
        ? {
            sourceRuleId: value.matched_rule.source_rule_id,
            startOffset: this.toInterval(value.matched_rule.start_offset),
          }
        : null,
      lastMaterializedAt: value.last_materialized_at,
    };
  }

  private static toNotificationMaterialization(value: any) {
    if (!value) return null;
    return {
      source: value.source,
      nextTriggerDate: value.next_trigger_date ?? null,
      lastTriggeredAt: value.last_triggered_at ?? null,
      materializedRulesCount: value.materialized_rules_count ?? 0,
      materializedRules: (value.materialized_rules ?? []).map((rule: any) => ({
        sourceRuleId: rule.source_rule_id,
        anchor: rule.anchor,
        startOffset: this.toInterval(rule.start_offset),
        triggerMode: rule.trigger_mode,
        repeatEvery: rule.repeat_every
          ? this.toInterval(rule.repeat_every)
          : null,
        repeatUntil: rule.repeat_until ?? null,
        repeatFor: rule.repeat_for ? this.toInterval(rule.repeat_for) : null,
        triggerEvents: (rule.trigger_events ?? []).map((event: any) => ({
          triggerDate: event.trigger_date,
          status: event.status,
          triggeredAt: event.triggered_at ?? null,
          failureReason: event.failure_reason ?? null,
        })),
        lastTriggeredAt: rule.last_triggered_at ?? null,
      })),
      lastMaterializedAt: value.last_materialized_at,
    };
  }

  private static toMongooseCustomerDelivery(value: any) {
    return {
      received_at: value.receivedAt,
      estimated_delivery_interval: this.toMongooseInterval(
        value.estimatedDeliveryInterval,
      ),
      estimated_delivery_at: value.estimatedDeliveryAt,
      delivered_to_customer_at: value.deliveredToCustomerAt,
      status_policy_id: value.statusPolicyId,
      notification_policy_id: value.notificationPolicyId,
      status_materialization: this.toMongooseStatusMaterialization(
        value.statusMaterialization,
      ),
      notification_materialization: this.toMongooseNotificationMaterialization(
        value.notificationMaterialization,
      ),
    };
  }

  private static toMongooseProvider(value: any) {
    return {
      provider_id: value.providerId,
      provider_name: value.providerName,
      delivered_to_provider_at: value.deliveredToProviderAt,
      estimated_return_interval: this.toMongooseInterval(
        value.estimatedReturnInterval,
      ),
      estimated_return_at: value.estimatedReturnAt,
      returned_from_provider_at: value.returnedFromProviderAt,
      status_policy_id: value.statusPolicyId,
      notification_policy_id: value.notificationPolicyId,
      follow_up: {
        enabled: value.followUp.enabled,
        rules: value.followUp.rules.map((rule: any) => ({
          rule_id: rule.ruleId,
          interval: this.toMongooseInterval(rule.interval),
          recipient_group_ids: rule.recipientGroupIds,
          cc_recipient_group_ids: rule.ccRecipientGroupIds,
        })),
      },
      status_materialization: this.toMongooseStatusMaterialization(
        value.statusMaterialization,
      ),
      notification_materialization: this.toMongooseNotificationMaterialization(
        value.notificationMaterialization,
      ),
      follow_up_materialization: value.followUpMaterialization.map(
        (item: any) => ({
          source: item.source,
          source_rule_id: item.sourceRuleId,
          trigger_date: item.triggerDate,
          status: item.status,
          triggered_at: item.triggeredAt,
          failure_reason: item.failureReason,
          last_materialized_at: item.lastMaterializedAt,
        }),
      ),
    };
  }

  private static toInterval(value: any) {
    return {
      years: value?.years ?? 0,
      months: value?.months ?? 0,
      weeks: value?.weeks ?? 0,
      days: value?.days ?? 0,
    };
  }
  private static toMongooseInterval(value: any) {
    return {
      years: value.years,
      months: value.months,
      weeks: value.weeks,
      days: value.days,
    };
  }
}
