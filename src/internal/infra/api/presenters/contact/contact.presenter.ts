import { Injectable } from '@nestjs/common';

import {
  ContactListItemDto,
  ContactSearchItemDto,
  ContactViewDto,
} from '@application/dto';
import { EnumNameService } from '@infra/i18n/services';

@Injectable()
export class ContactPresenter {
  constructor(private readonly enumNameService: EnumNameService) {}

  toCreateResponse(result: ContactViewDto) {
    return this.toViewResponse(result);
  }

  toUpdateResponse(result: ContactViewDto) {
    return this.toViewResponse(result);
  }

  toViewResponse(result: ContactViewDto) {
    return {
      contact_id: result.id,
      type: result.type,
      user_id: result.userId,
      name: result.name,
      lastname: result.lastname,
      full_name: result.fullName,
      company_names: result.companyNames,
      emails: result.emails.map((item) => this.toValueResponse(item)),
      phones: result.phones.map((item) => this.toValueResponse(item)),
      cell_phones: result.cellPhones.map((item) => this.toValueResponse(item)),
      status_id: result.status,
      status_name: this.enumNameService.getEnumName(
        `CONTACT.STATUS.${result.status}`,
      ),
      created_by: result.createdBy
        ? {
            user_id: result.createdBy.userId,
            name: result.createdBy.name,
            email: result.createdBy.email,
          }
        : null,
      updated_by: result.updatedBy
        ? {
            user_id: result.updatedBy.userId,
            name: result.updatedBy.name,
            email: result.updatedBy.email,
          }
        : null,
      created_at: result.createdAt,
      updated_at: result.updatedAt ?? null,
    };
  }

  toCollection(results: ContactListItemDto[]) {
    return results.map((result) => ({
      contact_id: result.id,
      type: result.type,
      user_id: result.userId,
      name: result.name,
      lastname: result.lastname,
      full_name: result.fullName,
      company_names: result.companyNames,
      primary_email: result.primaryEmail,
      primary_cell_phone: result.primaryCellPhone,
      status_id: result.status,
      status_name: this.enumNameService.getEnumName(
        `CONTACT.STATUS.${result.status}`,
      ),
      created_at: result.createdAt,
      updated_at: result.updatedAt ?? null,
    }));
  }

  toSearchCollection(results: ContactSearchItemDto[]) {
    return results.map((result) => ({
      contact_id: result.id,
      type: result.type,
      user_id: result.userId,
      full_name: result.fullName,
      company_names: result.companyNames,
      primary_email: result.primaryEmail,
      primary_cell_phone: result.primaryCellPhone,
    }));
  }

  private toValueResponse(item: { value: string }) {
    return {
      value: item.value,
    };
  }
}
