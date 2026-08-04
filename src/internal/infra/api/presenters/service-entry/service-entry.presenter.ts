import { Injectable } from '@nestjs/common';

import {
  CreateServiceEntryResultDto,
  ServiceEntryViewDto,
  ServiceEntryFilesMetadataDto,
  ServiceEntryInteractionStatusDto,
} from '@application/dto';
import { EnumNameService } from '@infra/i18n/services';
import { EnvService } from '@infra/env';

@Injectable()
export class ServiceEntryPresenter {
  private readonly apiBaseUrl: string;

  constructor(
    private readonly enumNameService: EnumNameService,
    private readonly envService: EnvService,
  ) {
    const baseUrl = this.envService.get('API_BASE_URL');
    this.apiBaseUrl = baseUrl.replace(/\/$/, '');
  }

  toCreateResponse(entry: CreateServiceEntryResultDto) {
    return this.toViewResponse({
      id: entry.id,
      companyName: entry.companyName,
      contactName: entry.contactName,
      contactEmail: entry.contactEmail,
      serviceOrderIdentifier: entry.serviceOrderIdentifier,
      category: entry.category,
      calibrationCertificateFileId: entry.calibrationCertificateFileId,
      attachmentFileIds: entry.attachmentFileIds,
      status: entry.status,
      surveyAccessId: entry.surveyAccessId,
      surveyTemplateId: entry.surveyTemplateId,
      surveyTemplateVersion: entry.surveyTemplateVersion,
      createdAt: entry.createdAt,
      updatedAt: entry.createdAt,
      filesMetadata: entry.filesMetadata,
      interactionStatus: entry.interactionStatus,
    });
  }

  toViewResponse(entry: ServiceEntryViewDto) {
    const filesMetadata = entry.filesMetadata;
    const interactionStatus = entry.interactionStatus;

    return {
      service_entry_id: entry.id,
      company_name: entry.companyName,
      contact_name: entry.contactName,
      contact_email: entry.contactEmail,
      service_order_identifier: entry.serviceOrderIdentifier,
      category_id: entry.category,
      category_name: this.enumNameService.getEnumName(
        `SERVICE_ENTRY.CATEGORY.${entry.category}`,
      ),
      calibration_certificate_file_id: entry.calibrationCertificateFileId,
      attachment_file_ids: entry.attachmentFileIds,
      status_id: entry.status,
      status_name: this.enumNameService.getEnumName(
        `SERVICE_ENTRY.STATUS.${entry.status}`,
      ),
      survey_access_id: entry.surveyAccessId,
      survey_template: entry.surveyTemplateId
        ? {
            template_id: entry.surveyTemplateId,
            version: entry.surveyTemplateVersion,
          }
        : null,
      created_at: entry.createdAt,
      updated_at: entry.updatedAt ?? null,
      files_metadata: this.toFilesMetadataResponse(filesMetadata, entry.id),
      survey_status: this.toSurveyStatusResponse(
        interactionStatus.surveyStatus,
      ),
      download_status: this.toDownloadStatusResponse(
        interactionStatus.downloadStatus,
      ),
    };
  }

  toCollection(entries: ServiceEntryViewDto[]) {
    return entries.map((entry) => this.toViewResponse(entry));
  }

  private toFilesMetadataResponse(
    metadata: ServiceEntryFilesMetadataDto,
    serviceEntryId: string,
  ) {
    return {
      calibration_certificate: metadata.calibrationCertificate
        ? this.toFileDescriptorResponse(
            metadata.calibrationCertificate,
            serviceEntryId,
          )
        : null,
      attachments: metadata.attachments.map((attachment) =>
        this.toFileDescriptorResponse(attachment, serviceEntryId),
      ),
    };
  }

  private toFileDescriptorResponse(
    descriptor: {
      fileId: string;
      originalName: string;
      extension: string;
    },
    serviceEntryId: string,
  ) {
    return {
      file_id: descriptor.fileId,
      original_name: descriptor.originalName,
      extension: descriptor.extension,
      download_url: this.buildDownloadUrl(descriptor.fileId, serviceEntryId),
    };
  }

  private buildDownloadUrl(fileId: string, serviceEntryId: string): string {
    const url = `${this.apiBaseUrl}/v1/files/${fileId}/download`;
    return `${url}?service_entry_id=${encodeURIComponent(serviceEntryId)}`;
  }

  private toSurveyStatusResponse(
    status: ServiceEntryInteractionStatusDto['surveyStatus'],
  ) {
    return {
      completed: status.completed,
      submitted_at: status.submittedAt ?? null,
    };
  }

  private toDownloadStatusResponse(
    status: ServiceEntryInteractionStatusDto['downloadStatus'],
  ) {
    return {
      has_download: status.hasDownload,
      last_downloaded_at: status.lastDownloadedAt ?? null,
      download_count: status.downloadCount,
    };
  }
}
