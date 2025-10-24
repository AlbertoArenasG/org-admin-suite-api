import { ServiceEntry } from '@domain/entities';
import { CreateServiceEntryResultDto } from '@application/dto';

export class ServiceEntryMapper {
  static toCreateResultDto(entry: ServiceEntry): CreateServiceEntryResultDto {
    return {
      id: entry.id,
      companyName: entry.companyName,
      contactName: entry.contactName,
      contactEmail: entry.contactEmail,
      serviceOrderIdentifier: entry.serviceOrderIdentifier,
      category: entry.category,
      calibrationCertificateFileId: entry.calibrationCertificateFileId,
      attachmentFileIds: entry.attachmentFileIds,
      createdAt: entry.createdAt ?? new Date(),
    };
  }
}
