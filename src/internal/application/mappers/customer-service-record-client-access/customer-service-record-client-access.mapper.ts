import { CustomerServiceRecord } from '@domain/entities';

import { CustomerServiceRecordClientAccessViewDto } from '@application/dto';

export class CustomerServiceRecordClientAccessMapper {
  static toViewDto(
    record: CustomerServiceRecord,
  ): CustomerServiceRecordClientAccessViewDto {
    return {
      id: record.id,
      serviceNumber: record.serviceNumber,
      serviceType: {
        code: record.serviceTypeCode,
        name: record.serviceTypeName,
      },
      observations: record.observations,
      customer: record.customer,
      assets: record.assets.map((asset) => ({
        assetId: asset.assetId!,
        name: asset.name,
        identifier: asset.identifier,
        brand: asset.brand,
        model: asset.model,
        serialNumber: asset.serialNumber,
      })),
      customerDelivery: {
        receivedAt: record.customerDelivery.receivedAt,
        estimatedDeliveryAt: record.customerDelivery.estimatedDeliveryAt,
        deliveredToCustomerAt: record.customerDelivery.deliveredToCustomerAt,
      },
      createdAt: record.createdAt ?? new Date(),
    };
  }
}
