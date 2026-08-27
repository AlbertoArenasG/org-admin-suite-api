import {
  AuditUserDto,
  ContactListItemDto,
  ContactSearchItemDto,
  ContactViewDto,
} from '@application/dto';
import { Contact } from '@domain/entities';

export class ContactMapper {
  static toListItemDto(contact: Contact): ContactListItemDto {
    return {
      id: contact.id,
      userId: contact.userId,
      isInternalStaff: contact.isInternalStaff,
      name: contact.name,
      lastname: contact.lastname,
      fullName: contact.fullName,
      companyNames: contact.companyNames,
      primaryEmail: contact.emails[0]?.value ?? null,
      primaryCellPhone: contact.cellPhones[0]?.value ?? null,
      status: contact.status,
      createdAt: contact.createdAt ?? new Date(),
      updatedAt: contact.updatedAt,
    };
  }

  static toSearchItemDto(contact: Contact): ContactSearchItemDto {
    return {
      id: contact.id,
      userId: contact.userId,
      isInternalStaff: contact.isInternalStaff,
      fullName: contact.fullName,
      companyNames: contact.companyNames,
      primaryEmail: contact.emails[0]?.value ?? null,
      primaryCellPhone: contact.cellPhones[0]?.value ?? null,
    };
  }

  static toViewDto(
    contact: Contact,
    createdBy?: AuditUserDto | null,
    updatedBy?: AuditUserDto | null,
  ): ContactViewDto {
    return {
      id: contact.id,
      userId: contact.userId,
      isInternalStaff: contact.isInternalStaff,
      name: contact.name,
      lastname: contact.lastname,
      fullName: contact.fullName,
      companyNames: contact.companyNames,
      emails: contact.emails.map((item) => ({ value: item.value })),
      phones: contact.phones.map((item) => ({ value: item.value })),
      cellPhones: contact.cellPhones.map((item) => ({ value: item.value })),
      status: contact.status,
      createdBy: createdBy ?? null,
      updatedBy: updatedBy ?? null,
      createdAt: contact.createdAt ?? new Date(),
      updatedAt: contact.updatedAt,
    };
  }
}
