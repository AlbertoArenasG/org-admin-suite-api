import { Injectable } from '@nestjs/common';

import { CreateServiceEntryResultDto } from '@application/dto';
import { EnumNameService } from '@infra/i18n/services';

@Injectable()
export class ServiceEntryPresenter {
  constructor(private readonly enumNameService: EnumNameService) {}

  toResponse(entry: CreateServiceEntryResultDto) {
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
      created_at: entry.createdAt,
    };
  }
}
