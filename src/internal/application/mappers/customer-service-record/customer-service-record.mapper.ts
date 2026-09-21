import {
  CustomerServiceRecord,
  CustomerServiceRecordFileAttachmentCollectionProps,
} from '@domain/entities';
import { CustomerServiceRecordViewDto } from '@application/dto';

export class CustomerServiceRecordMapper {
  static toViewDto(
    record: CustomerServiceRecord,
  ): CustomerServiceRecordViewDto {
    return {
      id: record.id,
      serviceNumber: record.serviceNumber,
      serviceNumberDisplay: record.serviceNumberDisplay,
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
        intakeConditionFiles: this.toAttachments(asset.intakeConditionFiles!),
        deliveryConditionFiles: this.toAttachments(
          asset.deliveryConditionFiles!,
        ),
        reports: this.toAttachments(asset.reports!),
      })),
      customerDelivery: record.customerDelivery,
      provider: record.provider,
      operationalStatus: record.operationalStatus,
      attachmentsCount: record.attachmentsCount,
      quotation: {
        referenceNumber: record.quotation.referenceNumber,
        files: this.toAttachments(record.quotation),
      },
      purchaseOrder: {
        referenceNumber: record.purchaseOrder.referenceNumber,
        files: this.toAttachments(record.purchaseOrder),
      },
      invoice: {
        referenceNumber: record.invoice.referenceNumber,
        files: this.toAttachments(record.invoice),
      },
      otherFiles: this.toAttachments(record.otherFiles),
      createdAt: record.createdAt ?? new Date(),
      updatedAt: record.updatedAt ?? null,
    };
  }

  private static toAttachments(
    collection: CustomerServiceRecordFileAttachmentCollectionProps,
  ) {
    return collection.files.map((file) => ({
      fileId: file.fileId,
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
    }));
  }
}
