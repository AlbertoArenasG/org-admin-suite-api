import { ServiceEntryCategory, ServiceEntryStatus } from '@domain/entities';
import {
  ServiceEntryFilesMetadataDto,
  ServiceEntryInteractionStatusDto,
} from './get-service-entries.dto';

export interface CreateServiceEntryDto {
  companyName: string;
  contactName: string;
  contactEmail: string;
  serviceOrderIdentifier: string;
  category: ServiceEntryCategory;
  calibrationCertificateFileId: string | null;
  attachmentFileIds: string[];
}

export interface CreateServiceEntryResultDto {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  serviceOrderIdentifier: string;
  category: ServiceEntryCategory;
  calibrationCertificateFileId: string | null;
  attachmentFileIds: string[];
  status: ServiceEntryStatus;
  publicAccessToken: string;
  surveyAccessId: string | null;
  surveyTemplateId: string | null;
  surveyTemplateVersion: number | null;
  createdAt: Date;
  filesMetadata: ServiceEntryFilesMetadataDto;
  interactionStatus: ServiceEntryInteractionStatusDto;
}
