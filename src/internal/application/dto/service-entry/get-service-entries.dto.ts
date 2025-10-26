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

export interface ServiceEntryViewDto {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  serviceOrderIdentifier: string;
  category: ServiceEntryCategory;
  calibrationCertificateFileId: string;
  attachmentFileIds: string[];
  status: ServiceEntryStatus;
  surveyAccessId: string | null;
  surveyTemplateId: string | null;
  surveyTemplateVersion: number | null;
  createdAt: Date;
  updatedAt?: Date;
  filesMetadata: ServiceEntryFilesMetadataDto;
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
