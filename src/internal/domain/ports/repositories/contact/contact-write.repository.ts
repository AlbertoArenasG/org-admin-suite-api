import { Contact } from '@domain/entities';

export interface IContactWriteRepository {
  create(contact: Contact): Promise<{ data: Contact | null }>;
  update(contact: Contact): Promise<{ data: Contact | null }>;
  replaceCompanyNamesForUsers(
    updates: Array<{ userId: string; companyNames: string[] }>,
  ): Promise<void>;
}

export const IContactWriteRepositoryToken = Symbol('IContactWriteRepository');
