import { ServiceEntry, ServiceEntryStatus } from '@domain/entities';
import { ServiceEntryDocument } from '@infra/persistence/mongoose/schemas';

export class MongooseServiceEntryMapper {
  static toDomain(document: ServiceEntryDocument): ServiceEntry | null {
    if (!document) {
      return null;
    }

    return new ServiceEntry({
      id: document.service_entry_id,
      companyName: document.company_name,
      contactName: document.contact_name,
      contactEmail: document.contact_email,
      serviceOrderIdentifier: document.service_order_identifier,
      category: document.category,
      calibrationCertificateFileId: document.calibration_certificate_file_id,
      attachmentFileIds: document.attachment_file_ids ?? [],
      status: document.status ?? ServiceEntryStatus.ACTIVE,
      surveyAccessId: document.survey_access_id ?? null,
      createdAt: document.createdAt ?? undefined,
      updatedAt: document.updatedAt ?? undefined,
    });
  }

  static toMongoose(entry: ServiceEntry) {
    return {
      service_entry_id: entry.id,
      company_name: entry.companyName,
      contact_name: entry.contactName,
      contact_email: entry.contactEmail,
      service_order_identifier: entry.serviceOrderIdentifier,
      category: entry.category,
      calibration_certificate_file_id: entry.calibrationCertificateFileId,
      attachment_file_ids: entry.attachmentFileIds,
      status: entry.status,
      survey_access_id: entry.surveyAccessId,
    };
  }
}
