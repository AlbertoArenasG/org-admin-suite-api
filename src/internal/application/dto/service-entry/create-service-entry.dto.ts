import { ServiceEntryCategory } from '@domain/entities';

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
  createdAt: Date;
}
