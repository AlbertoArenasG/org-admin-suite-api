import {
  ServicePackageRecord,
  ServicePackageRecordFileProps,
} from '@domain/entities';
import {
  IServicePackageRecordFileSchema,
  ServicePackageRecordDocument,
} from '@infra/persistence/mongoose/schemas';

export class MongooseServicePackageRecordMapper {
  static toDomain(
    document: ServicePackageRecordDocument | null,
  ): ServicePackageRecord | null {
    if (!document) {
      return null;
    }

    return new ServicePackageRecord({
      id: document.service_package_record_id,
      packageId: document.package_id,
      serviceOrder: document.service_order,
      originalFilename: document.original_filename ?? null,
      s3FolderKey: document.s3_folder_key,
      details: document.details ?? {},
      company: document.company ?? null,
      collectorName: document.collector_name ?? null,
      contactPerson: document.contact_person ?? null,
      email: document.email ?? null,
      phone: document.phone ?? null,
      address: document.address ?? null,
      visitDate: document.visit_date ?? null,
      serviceType: document.service_type ?? null,
      purpose: document.purpose ?? null,
      files: (document.files ?? []).map((file) =>
        this.mapFileDocumentToDomain(file),
      ),
      status: document.status ?? undefined,
      createdAt: document.createdAt ?? undefined,
      updatedAt: document.updatedAt ?? undefined,
    });
  }

  static toMongoose(record: ServicePackageRecord) {
    return {
      service_package_record_id: record.id,
      package_id: record.packageId,
      service_order: record.serviceOrder,
      original_filename: record.originalFilename,
      s3_folder_key: record.s3FolderKey,
      details: record.details,
      company: record.company,
      collector_name: record.collectorName,
      contact_person: record.contactPerson,
      email: record.email,
      phone: record.phone,
      address: record.address,
      visit_date: record.visitDate,
      service_type: record.serviceType,
      purpose: record.purpose,
      files: record.files.map((file) => this.mapFileDomainToDocument(file)),
      status: record.status,
    };
  }

  private static mapFileDocumentToDomain(
    file: IServicePackageRecordFileSchema,
  ): ServicePackageRecordFileProps {
    return {
      id: file.file_id,
      relativePath: file.relative_path,
      originalName: file.original_name,
      s3Key: file.s3_key,
      size: file.size,
      contentType: file.content_type,
    };
  }

  private static mapFileDomainToDocument(
    file: ServicePackageRecordFileProps,
  ): IServicePackageRecordFileSchema {
    return {
      file_id: file.id ?? file.s3Key,
      relative_path: file.relativePath,
      original_name: file.originalName,
      s3_key: file.s3Key,
      size: file.size,
      content_type: file.contentType,
    };
  }
}
