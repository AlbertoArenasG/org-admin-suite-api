import { ServiceEntry } from '@domain/entities';
import {
  CreateServiceEntryResultDto,
  ServiceEntryViewDto,
  ServiceEntryFilesMetadataDto,
  ServiceEntryInteractionStatusDto,
} from '@application/dto';
import {
  createEmptyServiceEntryFilesMetadata,
  createEmptyServiceEntryInteractionStatus,
} from '@application/utils';

export class ServiceEntryMapper {
  static toCreateResultDto(
    entry: ServiceEntry,
    publicAccessToken: string,
    filesMetadata?: ServiceEntryFilesMetadataDto,
    interactionStatus?: ServiceEntryInteractionStatusDto,
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
      interactionStatus:
        interactionStatus ?? createEmptyServiceEntryInteractionStatus(),
    };
  }

  static toViewDto(
    entry: ServiceEntry,
    filesMetadata?: ServiceEntryFilesMetadataDto,
    interactionStatus?: ServiceEntryInteractionStatusDto,
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
      interactionStatus:
        interactionStatus ?? createEmptyServiceEntryInteractionStatus(),
    };
  }

  static toCollection(
    entries: ServiceEntry[],
    metadataMap?: Map<string, ServiceEntryFilesMetadataDto>,
    statusMap?: Map<string, ServiceEntryInteractionStatusDto>,
  ): ServiceEntryViewDto[] {
    return entries.map((entry) =>
      this.toViewDto(
        entry,
        metadataMap?.get(entry.id),
        statusMap?.get(entry.id),
      ),
    );
  }
}
