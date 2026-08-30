import { CustomerServiceRecord } from '@domain/entities';
import { CustomerServiceRecordViewDto } from '@application/dto';

export class CustomerServiceRecordMapper {
  static toViewDto(
    record: CustomerServiceRecord,
  ): CustomerServiceRecordViewDto {
    return {
      id: record.id,
      serviceNumber: record.serviceNumber,
      serviceType: {
        code: record.serviceTypeCode,
        name: record.serviceTypeName,
      },
      requestedAt: record.requestedAt,
      observations: record.observations,
      customer: record.customer,
      assets: record.assets.map((asset) => ({
        assetId: asset.assetId!,
        name: asset.name,
        identifier: asset.identifier,
        brand: asset.brand,
        model: asset.model,
        serialNumber: asset.serialNumber,
        observations: asset.observations,
      })),
      customerDelivery: record.customerDelivery,
      provider: record.provider,
      operationalStatus: record.operationalStatus,
      createdAt: record.createdAt ?? new Date(),
      updatedAt: record.updatedAt ?? null,
    };
  }
}
