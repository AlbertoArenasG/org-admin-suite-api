import { Injectable } from '@nestjs/common';

import { CustomerServiceRecordViewDto } from '@application/dto';
import { EnvService } from '@infra/env';
import { EnumNameService } from '@infra/i18n/services';

@Injectable()
export class CustomerServiceRecordPresenter {
  private readonly apiBaseUrl: string;

  constructor(
    private readonly enumNameService: EnumNameService,
    private readonly envService: EnvService,
  ) {
    this.apiBaseUrl = this.envService.get('API_BASE_URL').replace(/\/$/, '');
  }

  toViewResponse(result: CustomerServiceRecordViewDto) {
    return {
      ...this.toListResponse(result),
      assets: result.assets.map((asset) => ({
        asset_id: asset.assetId,
        name: asset.name,
        identifier: asset.identifier,
        brand: asset.brand,
        model: asset.model,
        serial_number: asset.serialNumber,
        observations: asset.observations,
        intake_condition_files: this.toAttachments(asset.intakeConditionFiles),
        delivery_condition_files: this.toAttachments(
          asset.deliveryConditionFiles,
        ),
        reports: this.toAttachments(asset.reports),
      })),
      quotation: this.toDocument(result.quotation),
      purchase_order: this.toDocument(result.purchaseOrder),
      invoice: this.toDocument(result.invoice),
      other_files: this.toAttachments(result.otherFiles),
      created_at: result.createdAt,
      updated_at: result.updatedAt,
    };
  }

  toCollection(results: CustomerServiceRecordViewDto[]) {
    return results.map((result) => this.toListResponse(result));
  }

  private toListResponse(result: CustomerServiceRecordViewDto) {
    return {
      customer_service_record_id: result.id,
      service_number: result.serviceNumber,
      service_number_display: result.serviceNumberDisplay,
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
      attachments_count: result.attachmentsCount,
      operational_status: this.localized(
        'OPERATIONAL_STATUS',
        result.operationalStatus,
      ),
      created_at: result.createdAt,
      updated_at: result.updatedAt,
    };
  }

  private toAttachments(
    files: Array<{
      fileId: string;
      originalName: string;
      mimeType: string;
      size: number;
    }>,
  ) {
    return files.map((file) => ({
      file_id: file.fileId,
      original_name: file.originalName,
      mime_type: file.mimeType,
      size: file.size,
      download_url: this.buildDownloadUrl(file.fileId),
      preview_url: this.buildPreviewUrl(file.fileId),
    }));
  }

  private toDocument(value: {
    referenceNumber: string | null;
    files: Array<{
      fileId: string;
      originalName: string;
      mimeType: string;
      size: number;
    }>;
  }) {
    return {
      reference_number: value.referenceNumber,
      files: this.toAttachments(value.files),
    };
  }

  private buildDownloadUrl(fileId: string): string {
    return `${this.apiBaseUrl}/v1/files/${fileId}/download`;
  }

  private buildPreviewUrl(fileId: string): string {
    return `${this.buildDownloadUrl(fileId)}?disposition=inline`;
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
      work_order_reference: value.workOrderReference,
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
