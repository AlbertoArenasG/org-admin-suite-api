import { ServiceEntry } from '@domain/entities';
import {
  CreateServiceEntryResultDto,
  ServiceEntryViewDto,
  ServiceEntryFilesMetadataDto,
} from '@application/dto';
import { createEmptyServiceEntryFilesMetadata } from '@application/utils';

export class ServiceEntryMapper {
  static toCreateResultDto(
    entry: ServiceEntry,
    publicAccessToken: string,
    filesMetadata?: ServiceEntryFilesMetadataDto,
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
      surveyTemplateId: entry.surveyTemplateId,
      surveyTemplateVersion: entry.surveyTemplateVersion,
      createdAt: entry.createdAt ?? new Date(),
      filesMetadata: filesMetadata ?? createEmptyServiceEntryFilesMetadata(),
    };
  }

  static toViewDto(
    entry: ServiceEntry,
    filesMetadata?: ServiceEntryFilesMetadataDto,
  ): ServiceEntryViewDto {
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
      surveyTemplateId: entry.surveyTemplateId,
      surveyTemplateVersion: entry.surveyTemplateVersion,
      createdAt: entry.createdAt ?? new Date(),
      updatedAt: entry.updatedAt,
      filesMetadata: filesMetadata ?? createEmptyServiceEntryFilesMetadata(),
    };
  }

  static toCollection(
    entries: ServiceEntry[],
    metadataMap?: Map<string, ServiceEntryFilesMetadataDto>,
  ): ServiceEntryViewDto[] {
    return entries.map((entry) =>
      this.toViewDto(entry, metadataMap?.get(entry.id)),
    );
  }
}
