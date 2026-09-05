import { Injectable } from '@nestjs/common';
import {
  CustomerServiceRecordClientAccessViewDto,
  CustomerServiceRecordClientAccessCustomerOptionDto,
  CustomerServiceRecordClientAccessServiceTypeOptionDto,
} from '@application/dto';

@Injectable()
export class CustomerServiceRecordClientAccessPresenter {
  toListResponse(value: CustomerServiceRecordClientAccessViewDto) {
    return {
      customer_service_record_id: value.id,
      service_number: String(value.serviceNumber).padStart(4, '0'),
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
      })),
      customer_delivery: {
        received_at: value.customerDelivery.receivedAt,
        estimated_delivery_at: value.customerDelivery.estimatedDeliveryAt,
        delivered_to_customer_at: value.customerDelivery.deliveredToCustomerAt,
      },
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
}
