import { ServiceEntry } from '@domain/entities';
import {
  CreateServiceEntryResultDto,
  ServiceEntryViewDto,
} from '@application/dto';

export class ServiceEntryMapper {
  static toCreateResultDto(
    entry: ServiceEntry,
    publicAccessToken: string,
  ): CreateServiceEntryResultDto {
    return {
      id: entry.id,
      companyName: entry.companyName,
      contactName: entry.contactName,
      contactEmail: entry.contactEmail,
      serviceOrderIdentifier: entry.serviceOrderIdentifier,
      category: entry.category,
      calibrationCertificateFileId: entry.calibrationCertificateFileId,
      attachmentFileIds: entry.attachmentFileIds,
      status: entry.status,
      publicAccessToken,
      surveyAccessId: entry.surveyAccessId,
      createdAt: entry.createdAt ?? new Date(),
    };
  }

  static toViewDto(entry: ServiceEntry): ServiceEntryViewDto {
    return {
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
      createdAt: entry.createdAt ?? new Date(),
      updatedAt: entry.updatedAt,
    };
  }

  static toCollection(entries: ServiceEntry[]): ServiceEntryViewDto[] {
    return entries.map((entry) => this.toViewDto(entry));
  }
}
