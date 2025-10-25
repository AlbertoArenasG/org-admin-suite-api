import { ServiceEntryCategory, ServiceEntryStatus } from '@domain/entities';

export interface CreateServiceEntryDto {
  companyName: string;
  contactName: string;
  contactEmail: string;
  serviceOrderIdentifier: string;
  category: ServiceEntryCategory;
  calibrationCertificateFileId: string;
  attachmentFileIds: string[];
}

export interface CreateServiceEntryResultDto {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  serviceOrderIdentifier: string;
  category: ServiceEntryCategory;
  calibrationCertificateFileId: string;
  attachmentFileIds: string[];
  status: ServiceEntryStatus;
  publicAccessToken: string;
  surveyAccessId: string | null;
  createdAt: Date;
}
