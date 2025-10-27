import { ServiceEntryCategory } from '@domain/entities';

export interface UpdateServiceEntryDto {
  id: string;
  companyName?: string;
  contactName?: string;
  contactEmail?: string;
  serviceOrderIdentifier?: string;
  category?: ServiceEntryCategory;
  calibrationCertificateFileId?: string | null;
  attachmentFileIds?: string[];
}

export type UpdateServiceEntryResultDto = UpdateServiceEntryDto & {
  id: string;
};
