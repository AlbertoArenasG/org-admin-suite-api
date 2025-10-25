import { Injectable } from '@nestjs/common';

import {
  CreateServiceEntryResultDto,
  ServiceEntryViewDto,
} from '@application/dto';
import { EnumNameService } from '@infra/i18n/services';

@Injectable()
export class ServiceEntryPresenter {
  constructor(private readonly enumNameService: EnumNameService) {}

  toCreateResponse(entry: CreateServiceEntryResultDto) {
    const base = this.toViewResponse({
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
      createdAt: entry.createdAt,
      updatedAt: entry.createdAt,
    });

    return {
      ...base,
      public_access_token: entry.publicAccessToken,
    };
  }

  toViewResponse(entry: ServiceEntryViewDto) {
    return {
      service_entry_id: entry.id,
      company_name: entry.companyName,
      contact_name: entry.contactName,
      contact_email: entry.contactEmail,
      service_order_identifier: entry.serviceOrderIdentifier,
      category_id: entry.category,
      category_name: this.enumNameService.getEnumName(
        `SERVICE_ENTRY.CATEGORY.${entry.category}`,
      ),
      calibration_certificate_file_id: entry.calibrationCertificateFileId,
      attachment_file_ids: entry.attachmentFileIds,
      status_id: entry.status,
      status_name: this.enumNameService.getEnumName(
        `SERVICE_ENTRY.STATUS.${entry.status}`,
      ),
      survey_access_id: entry.surveyAccessId,
      created_at: entry.createdAt,
      updated_at: entry.updatedAt ?? null,
    };
  }

  toCollection(entries: ServiceEntryViewDto[]) {
    return entries.map((entry) => this.toViewResponse(entry));
  }
}
