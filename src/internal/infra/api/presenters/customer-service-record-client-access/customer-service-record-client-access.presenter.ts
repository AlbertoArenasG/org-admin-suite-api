import { Injectable } from '@nestjs/common';
import {
  CustomerServiceRecordClientAccessViewDto,
  CustomerServiceRecordClientAccessCustomerOptionDto,
  CustomerServiceRecordClientAccessServiceTypeOptionDto,
} from '@application/dto';
import {
  CustomerServiceRecordCustomerDeliveryProps,
  CustomerServiceRecordNotificationMaterializationProps,
  CustomerServiceRecordStatusMaterializationProps,
} from '@domain/entities';
import { EnumNameService } from '@infra/i18n/services';

@Injectable()
export class CustomerServiceRecordClientAccessPresenter {
  constructor(private readonly enumNameService: EnumNameService) {}

  toListResponse(value: CustomerServiceRecordClientAccessViewDto) {
    return {
      customer_service_record_id: value.id,
      service_number: value.serviceNumber,
      service_number_display: value.serviceNumberDisplay,
      service_type: {
        service_type_code: value.serviceType.code,
        name: value.serviceType.name,
      },
      observations: value.observations,
      customer: {
        customer_id: value.customer.customerId,
        name: value.customer.customerName,
      },
      assets: value.assets.map((asset) => ({
        asset_id: asset.assetId,
        name: asset.name,
        identifier: asset.identifier,
        brand: asset.brand,
        model: asset.model,
        serial_number: asset.serialNumber,
        observations: asset.observations,
      })),
      customer_delivery: this.customerDelivery(value.customerDelivery),
      operational_status: this.localized(
        'OPERATIONAL_STATUS',
        value.operationalStatus,
      ),
    };
  }
  toCollection(values: CustomerServiceRecordClientAccessViewDto[]) {
    return values.map((value) => this.toListResponse(value));
  }
  toViewResponse(value: CustomerServiceRecordClientAccessViewDto) {
    const result = this.toListResponse(value);
    return {
      ...result,
      customer: {
        ...result.customer,
        users: value.customer.users.map((user) => ({
          user_id: user.userId,
          name: user.name,
          email: user.email,
        })),
      },
      created_at: value.createdAt,
    };
  }
  toCustomerOptions(
    values: CustomerServiceRecordClientAccessCustomerOptionDto[],
  ) {
    return values.map((value) => ({
      customer_id: value.customerId,
      company_name: value.name,
    }));
  }
  toServiceTypeOptions(
    values: CustomerServiceRecordClientAccessServiceTypeOptionDto[],
  ) {
    return values.map((value) => ({ code: value.code, name: value.name }));
  }

  private customerDelivery(value: CustomerServiceRecordCustomerDeliveryProps) {
    return {
      received_at: value.receivedAt,
      estimated_delivery_interval: value.estimatedDeliveryInterval,
      estimated_delivery_at: value.estimatedDeliveryAt,
      delivered_to_customer_at: value.deliveredToCustomerAt,
      status_policy_id: value.statusPolicyId,
      notification_policy_id: value.notificationPolicyId,
      status_materialization: this.statusMaterialization(
        value.statusMaterialization,
      ),
      notification_materialization: this.notificationMaterialization(
        value.notificationMaterialization,
      ),
    };
  }

  private statusMaterialization(
    value: CustomerServiceRecordStatusMaterializationProps | null,
  ) {
    if (!value) return null;
    return {
      source: this.localized('MATERIALIZATION_SOURCE', value.source),
      code: value.code,
      name:
        value.source === 'POLICY'
          ? value.label
          : this.enumNameService.getEnumName(value.labelKey),
      name_key: value.labelKey,
      color_hex: value.colorHex,
      effective_start_date: value.effectiveStartDate,
      matched_rule: value.matchedRule
        ? {
            source_rule_id: value.matchedRule.sourceRuleId,
            start_offset: value.matchedRule.startOffset,
          }
        : null,
      last_materialized_at: value.lastMaterializedAt,
    };
  }

  private notificationMaterialization(
    value: CustomerServiceRecordNotificationMaterializationProps | null,
  ) {
    if (!value) return null;
    return {
      source: this.localized('MATERIALIZATION_SOURCE', value.source),
      next_trigger_date: value.nextTriggerDate,
      last_triggered_at: value.lastTriggeredAt,
      materialized_rules_count: value.materializedRulesCount,
      materialized_rules: value.materializedRules.map((rule) => ({
        source_rule_id: rule.sourceRuleId,
        anchor: rule.anchor,
        start_offset: rule.startOffset,
        trigger_mode: rule.triggerMode,
        repeat_every: rule.repeatEvery,
        repeat_until: rule.repeatUntil,
        repeat_for: rule.repeatFor,
        trigger_events: rule.triggerEvents.map((event) => ({
          trigger_date: event.triggerDate,
          status: this.localized('NOTIFICATION_EVENT_STATUS', event.status),
          triggered_at: event.triggeredAt,
          failure_reason: event.failureReason,
        })),
        last_triggered_at: rule.lastTriggeredAt,
      })),
      last_materialized_at: value.lastMaterializedAt,
    };
  }

  private localized(group: string, code: string) {
    const nameKey = `CUSTOMER_SERVICE_RECORD.${group}.${code}`;
    return {
      code,
      name: this.enumNameService.getEnumName(nameKey),
      name_key: nameKey,
    };
  }
}
