import { Contact } from '@domain/entities';
import { ContactDocument } from '@infra/persistence/mongoose/schemas/contact/contact.schema';

export class MongooseContactMapper {
  static toDomain(document: ContactDocument | null): Contact | null {
    if (!document) {
      return null;
    }

    return new Contact({
      id: document.contact_id,
      userId: document.user_id ?? null,
      isInternalStaff: document.is_internal_staff,
      name: document.name,
      lastname: document.lastname,
      companyNames: document.company_names ?? [],
      emails: (document.emails ?? []).map((item) => ({ value: item.value })),
      phones: (document.phones ?? []).map((item) => ({ value: item.value })),
      cellPhones: (document.cell_phones ?? []).map((item) => ({
        value: item.value,
      })),
      status: document.status,
      createdBy: document.created_by ?? null,
      updatedBy: document.updated_by ?? null,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    });
  }

  static toMongoose(contact: Contact) {
    return {
      user_id: contact.userId,
      is_internal_staff: contact.isInternalStaff,
      name: contact.name,
      lastname: contact.lastname,
      full_name: contact.fullName,
      company_names: contact.companyNames,
      emails: contact.emails.map((item) => ({ value: item.value })),
      phones: contact.phones.map((item) => ({ value: item.value })),
      cell_phones: contact.cellPhones.map((item) => ({ value: item.value })),
      status: contact.status,
      created_by: contact.createdBy,
      updated_by: contact.updatedBy,
    };
  }
}
