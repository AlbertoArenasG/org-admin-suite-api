import {
  AuditUserDto,
  RecipientGroupContactSummaryDto,
  RecipientGroupListItemDto,
  RecipientGroupViewDto,
} from '@application/dto';
import { Contact, RecipientGroup } from '@domain/entities';

export class RecipientGroupMapper {
  static toListItemDto(
    recipientGroup: RecipientGroup,
  ): RecipientGroupListItemDto {
    return {
      id: recipientGroup.id,
      name: recipientGroup.name,
      code: recipientGroup.code,
      description: recipientGroup.description,
      enabledChannels: recipientGroup.enabledChannels.map((code) => ({ code })),
      contactsCount: recipientGroup.contactIds.length,
      status: recipientGroup.status,
      createdAt: recipientGroup.createdAt ?? new Date(),
      updatedAt: recipientGroup.updatedAt,
    };
  }

  static toViewDto(
    recipientGroup: RecipientGroup,
    contacts: Contact[],
    createdBy?: AuditUserDto | null,
    updatedBy?: AuditUserDto | null,
  ): RecipientGroupViewDto {
    return {
      id: recipientGroup.id,
      name: recipientGroup.name,
      code: recipientGroup.code,
      description: recipientGroup.description,
      enabledChannels: recipientGroup.enabledChannels.map((code) => ({ code })),
      contacts: contacts.map((contact) => this.toContactSummary(contact)),
      status: recipientGroup.status,
      createdBy: createdBy ?? null,
      updatedBy: updatedBy ?? null,
      createdAt: recipientGroup.createdAt ?? new Date(),
      updatedAt: recipientGroup.updatedAt,
    };
  }

  private static toContactSummary(
    contact: Contact,
  ): RecipientGroupContactSummaryDto {
    return {
      id: contact.id,
      userId: contact.userId,
      isInternalStaff: contact.isInternalStaff,
      fullName: contact.fullName,
      companyNames: contact.companyNames,
      primaryEmail: contact.emails[0]?.value ?? null,
      primaryCellPhone: contact.cellPhones[0]?.value ?? null,
      status: contact.status,
    };
  }
}
