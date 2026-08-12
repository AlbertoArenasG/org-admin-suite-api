import { Contact } from '@domain/entities';

export interface IContactWriteRepository {
  create(contact: Contact): Promise<{ data: Contact | null }>;
  update(contact: Contact): Promise<{ data: Contact | null }>;
}

export const IContactWriteRepositoryToken = Symbol('IContactWriteRepository');
