import {
  PaginatedResultDto,
  PaginationParamsDto,
} from '@application/dto/shared';
import { ServiceEntryCategory, ServiceEntryStatus } from '@domain/entities';

export interface ServiceEntryFileDescriptorDto {
  fileId: string;
  originalName: string;
  extension: string;
}

export interface ServiceEntryFilesMetadataDto {
  calibrationCertificate: ServiceEntryFileDescriptorDto | null;
  attachments: ServiceEntryFileDescriptorDto[];
}

export interface ServiceEntrySurveyStatusDto {
  completed: boolean;
  submittedAt: Date | null;
}

export interface ServiceEntryDownloadStatusDto {
  hasDownload: boolean;
  lastDownloadedAt: Date | null;
  downloadCount: number;
}

export interface ServiceEntryInteractionStatusDto {
  surveyStatus: ServiceEntrySurveyStatusDto;
  downloadStatus: ServiceEntryDownloadStatusDto;
}

export interface ServiceEntryViewDto {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  serviceOrderIdentifier: string;
  category: ServiceEntryCategory;
  calibrationCertificateFileId: string | null;
  attachmentFileIds: string[];
  status: ServiceEntryStatus;
  surveyAccessId: string | null;
  surveyTemplateId: string | null;
  surveyTemplateVersion: number | null;
  createdAt: Date;
  updatedAt?: Date;
  filesMetadata: ServiceEntryFilesMetadataDto;
  interactionStatus: ServiceEntryInteractionStatusDto;
}

export interface GetServiceEntriesDto extends PaginationParamsDto {
  search?: string | null;
  sorts: Array<{
    field:
      | 'company_name'
      | 'contact_name'
      | 'contact_email'
      | 'service_order_identifier'
      | 'created_at';
    direction: 'asc' | 'desc';
  }>;
}

export type GetServiceEntriesResultDto =
  PaginatedResultDto<ServiceEntryViewDto>;
