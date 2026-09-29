import { Injectable } from '@nestjs/common';

import {
  IngestServicePackageResultDto,
  ServicePackageRecordViewDto,
  GetServicePackageRecordsResultDto,
} from '@application/dto';
import { EnvService } from '@infra/env';

@Injectable()
export class ServicePackagePresenter {
  private readonly apiBaseUrl: string;

  constructor(private readonly envService: EnvService) {
    this.apiBaseUrl = this.envService.get('API_BASE_URL').replace(/\/$/, '');
  }

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
        mime_type: file.contentType,
        size: file.size,
        download_url: this.buildDownloadUrl(record.id, file.fileId),
        preview_url: this.buildPreviewUrl(record.id, file.fileId),
      })),
    };
  }

  private buildDownloadUrl(recordId: string, fileId: string): string {
    return `${this.apiBaseUrl}/v1/service-packages/records/${recordId}/files/${fileId}/download`;
  }

  private buildPreviewUrl(recordId: string, fileId: string): string {
    return `${this.buildDownloadUrl(recordId, fileId)}?disposition=inline`;
  }
}
