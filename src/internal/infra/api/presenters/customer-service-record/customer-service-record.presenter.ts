import { Injectable } from '@nestjs/common';
import { CustomerServiceRecordViewDto } from '@application/dto';
import { EnumNameService } from '@infra/i18n/services';

@Injectable()
export class CustomerServiceRecordPresenter {
  constructor(private readonly enumNameService: EnumNameService) {}
  toViewResponse(result: CustomerServiceRecordViewDto) {
    return {
      customer_service_record_id: result.id,
      service_number: String(result.serviceNumber).padStart(4, '0'),
      service_type: {
        service_type_code: result.serviceType.code,
        name: result.serviceType.name,
      },
      requested_at: result.requestedAt,
      observations: result.observations,
      customer: {
        customer_id: result.customer.customerId,
        name: result.customer.customerName,
        users: result.customer.users.map((user) => ({
          user_id: user.userId,
          name: user.name,
          email: user.email,
        })),
      },
      assets: result.assets.map((asset) => ({
        asset_id: asset.assetId,
        name: asset.name,
        identifier: asset.identifier,
        brand: asset.brand,
        model: asset.model,
        serial_number: asset.serialNumber,
        observations: asset.observations,
      })),
      customer_delivery: this.customerDelivery(result.customerDelivery),
      provider: result.provider ? this.provider(result.provider) : null,
      operational_status: this.localized(
        'OPERATIONAL_STATUS',
        result.operationalStatus,
      ),
      created_at: result.createdAt,
      updated_at: result.updatedAt,
    };
  }
  toCollection(results: CustomerServiceRecordViewDto[]) {
    return results.map((result) => this.toViewResponse(result));
  }
  private customerDelivery(value: any) {
    return {
      received_at: value.receivedAt,
      estimated_delivery_interval: value.estimatedDeliveryInterval,
      estimated_delivery_at: value.estimatedDeliveryAt,
      delivered_to_customer_at: value.deliveredToCustomerAt,
      status_policy_id: value.statusPolicyId,
      notification_policy_id: value.notificationPolicyId,
      status_materialization: this.materialization(value.statusMaterialization),
      notification_materialization: this.notifications(
        value.notificationMaterialization,
      ),
    };
  }
  private provider(value: any) {
    return {
      provider_id: value.providerId,
      name: value.providerName,
      delivered_to_provider_at: value.deliveredToProviderAt,
      estimated_return_interval: value.estimatedReturnInterval,
      estimated_return_at: value.estimatedReturnAt,
      returned_from_provider_at: value.returnedFromProviderAt,
      status_policy_id: value.statusPolicyId,
      notification_policy_id: value.notificationPolicyId,
      follow_up: value.followUp,
      status_materialization: this.materialization(value.statusMaterialization),
      notification_materialization: this.notifications(
        value.notificationMaterialization,
      ),
      follow_up_materialization: (value.followUpMaterialization ?? []).map(
        (item: any) => ({
          ...item,
          status: this.localized(
            'PROVIDER_FOLLOW_UP_EVENT_STATUS',
            item.status,
          ),
        }),
      ),
    };
  }
  private materialization(value: any) {
    if (!value) return null;
    return {
      code: value.code,
      name:
        value.source === 'POLICY'
          ? value.label
          : this.enumNameService.getEnumName(value.labelKey),
      name_key: value.labelKey,
      color_hex: value.colorHex,
      source: this.localized('MATERIALIZATION_SOURCE', value.source),
      effective_start_date: value.effectiveStartDate,
    };
  }
  private notifications(value: any) {
    if (!value) return null;
    return {
      ...value,
      source: this.localized('MATERIALIZATION_SOURCE', value.source),
      materializedRules: (value.materializedRules ?? []).map((rule: any) => ({
        ...rule,
        triggerEvents: (rule.triggerEvents ?? []).map((event: any) => ({
          ...event,
          status: this.localized('NOTIFICATION_EVENT_STATUS', event.status),
        })),
      })),
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
