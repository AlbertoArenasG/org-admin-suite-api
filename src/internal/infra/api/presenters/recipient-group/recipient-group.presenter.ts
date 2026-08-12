import { Injectable } from '@nestjs/common';

import {
  RecipientGroupChannelDto,
  RecipientGroupListItemDto,
  RecipientGroupViewDto,
} from '@application/dto';
import { getCommunicationChannel } from '@application/services/communication-channels';
import { EnumNameService } from '@infra/i18n/services';

@Injectable()
export class RecipientGroupPresenter {
  constructor(private readonly enumNameService: EnumNameService) {}

  toCreateResponse(result: RecipientGroupViewDto) {
    return this.toViewResponse(result);
  }

  toUpdateResponse(result: RecipientGroupViewDto) {
    return this.toViewResponse(result);
  }

  toViewResponse(result: RecipientGroupViewDto) {
    return {
      recipient_group_id: result.id,
      name: result.name,
      code: result.code,
      description: result.description,
      enabled_channels: result.enabledChannels.map((item) =>
        this.toChannelResponse(item),
      ),
      contacts: result.contacts.map((contact) => ({
        contact_id: contact.id,
        type: contact.type,
        user_id: contact.userId,
        full_name: contact.fullName,
        company_name: contact.companyName,
        primary_email: contact.primaryEmail,
        primary_cell_phone: contact.primaryCellPhone,
        status_id: contact.status,
        status_name: this.enumNameService.getEnumName(
          `CONTACT.STATUS.${contact.status}`,
        ),
      })),
      status_id: result.status,
      status_name: this.enumNameService.getEnumName(
        `RECIPIENT_GROUP.STATUS.${result.status}`,
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

  toCollection(results: RecipientGroupListItemDto[]) {
    return results.map((result) => ({
      recipient_group_id: result.id,
      name: result.name,
      code: result.code,
      description: result.description,
      enabled_channels: result.enabledChannels.map((item) =>
        this.toChannelResponse(item),
      ),
      contacts_count: result.contactsCount,
      status_id: result.status,
      status_name: this.enumNameService.getEnumName(
        `RECIPIENT_GROUP.STATUS.${result.status}`,
      ),
      created_at: result.createdAt,
      updated_at: result.updatedAt ?? null,
    }));
  }

  private toChannelResponse(channel: RecipientGroupChannelDto) {
    const catalogItem = getCommunicationChannel(channel.code);

    return {
      code: channel.code,
      name: catalogItem
        ? this.enumNameService.getEnumName(catalogItem.nameKey)
        : channel.code,
      name_key: catalogItem?.nameKey ?? null,
    };
  }
}
