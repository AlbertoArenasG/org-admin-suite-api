import {
  ServicePackageRecord,
  ServicePackageRecordFileProps,
} from '@domain/entities';
import {
  ServicePackageRecordFileDto,
  ServicePackageRecordViewDto,
} from '@application/dto';

export class ServicePackageRecordMapper {
  static toViewDto(record: ServicePackageRecord): ServicePackageRecordViewDto {
    return {
      id: record.id,
      packageId: record.packageId,
      serviceOrder: record.serviceOrder,
      originalFilename: record.originalFilename,
      s3FolderKey: record.s3FolderKey,
      details: record.details,
      company: record.company,
      collectorName: record.collectorName,
      contactPerson: record.contactPerson,
      email: record.email,
      phone: record.phone,
      address: record.address,
      visitDate: record.visitDate,
      serviceType: record.serviceType,
      purpose: record.purpose,
      files: record.files.map((file) => this.toFileDto(file)),
      status: record.status,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  private static toFileDto(
    file: ServicePackageRecordFileProps,
  ): ServicePackageRecordFileDto {
    return {
      fileId: file.id ?? file.s3Key,
      relativePath: file.relativePath,
      originalName: file.originalName,
      s3Key: file.s3Key,
      size: file.size,
      contentType: file.contentType,
    };
  }
}
