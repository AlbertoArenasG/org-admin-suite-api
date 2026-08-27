import { Contact, ContactStatus } from '@domain/entities';

export type ContactSortField = 'name' | 'lastname' | 'status' | 'created_at';
export type ContactSortDirection = 'asc' | 'desc';

export interface FindContactsParams {
  page: number;
  perPage: number;
  search?: string | null;
  status?: ContactStatus | null;
  isInternalStaff?: boolean | null;
  sorts: Array<{ field: ContactSortField; direction: ContactSortDirection }>;
}

export interface FindContactsResult {
  data: Contact[];
  total: number;
}

export interface SearchContactsParams {
  q: string;
  limit: number;
}

export interface IContactReadRepository {
  findById(contactId: string): Promise<{ data: Contact | null }>;
  findByIds(contactIds: string[]): Promise<{ data: Contact[] }>;
  findByUserId(userId: string): Promise<{ data: Contact | null }>;
  findAll(params: FindContactsParams): Promise<FindContactsResult>;
  search(params: SearchContactsParams): Promise<{ data: Contact[] }>;
}

export const IContactReadRepositoryToken = Symbol('IContactReadRepository');
