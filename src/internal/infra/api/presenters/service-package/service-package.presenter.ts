import { Injectable } from '@nestjs/common';

import {
  IngestServicePackageResultDto,
  ServicePackageRecordViewDto,
  GetServicePackageRecordsResultDto,
} from '@application/dto';

@Injectable()
export class ServicePackagePresenter {
  toIngestResponse(result: IngestServicePackageResultDto) {
    return {
      package_id: result.packageId,
      services: result.services.map((service) => ({
        record_id: service.recordId,
        service_order: service.serviceOrder,
        file_count: service.fileCount,
      })),
    };
  }

  toCollection(result: GetServicePackageRecordsResultDto) {
    return result.items.map((item) => this.toViewResponse(item));
  }

  toViewResponse(record: ServicePackageRecordViewDto) {
    return {
      record_id: record.id,
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
      status: record.status,
      created_at: record.createdAt ?? null,
      updated_at: record.updatedAt ?? null,
      files: record.files.map((file) => ({
        file_id: file.fileId,
        relative_path: file.relativePath,
        original_name: file.originalName,
        s3_key: `https://icsacv-files.s3.us-east-1.amazonaws.com/${file.s3Key}`,
        size: file.size,
        content_type: file.contentType,
      })),
    };
  }
}
