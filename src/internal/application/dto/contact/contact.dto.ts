import {
  AuditUserDto,
  PaginatedResultDto,
  PaginationParamsDto,
} from '@application/dto/shared';
import { ContactStatus } from '@domain/entities';
import {
  ContactSortDirection,
  ContactSortField,
  ContactTypeFilter,
} from '@domain/ports/repositories';

export interface ContactValueDto {
  value: string;
}

export interface ContactListItemDto {
  id: string;
  type: ContactTypeFilter;
  userId: string | null;
  isInternalStaff: boolean;
  name: string;
  lastname: string;
  fullName: string;
  companyNames: string[];
  primaryEmail: string | null;
  primaryCellPhone: string | null;
  status: ContactStatus;
  createdAt: Date;
  updatedAt?: Date;
}

export interface ContactSearchItemDto {
  id: string;
  type: ContactTypeFilter;
  userId: string | null;
  isInternalStaff: boolean;
  fullName: string;
  companyNames: string[];
  primaryEmail: string | null;
  primaryCellPhone: string | null;
}

export interface ContactViewDto {
  id: string;
  type: ContactTypeFilter;
  userId: string | null;
  isInternalStaff: boolean;
  name: string;
  lastname: string;
  fullName: string;
  companyNames: string[];
  emails: ContactValueDto[];
  phones: ContactValueDto[];
  cellPhones: ContactValueDto[];
  status: ContactStatus;
  createdBy: AuditUserDto | null;
  updatedBy: AuditUserDto | null;
  createdAt: Date;
  updatedAt?: Date;
}

export interface GetContactsDto extends PaginationParamsDto {
  search: string | null;
  status: ContactStatus | null;
  type: ContactTypeFilter | null;
  sorts: Array<{ field: ContactSortField; direction: ContactSortDirection }>;
}

export type GetContactsResultDto = PaginatedResultDto<ContactListItemDto>;

export interface SearchContactsDto {
  q: string;
  limit: number;
}

export interface CreateContactDto {
  actorUserId: string;
  isInternalStaff: boolean;
  name: string;
  lastname: string;
  companyNames: string[];
  emails: ContactValueDto[];
  phones: ContactValueDto[];
  cellPhones: ContactValueDto[];
}

export interface UpdateContactDto extends CreateContactDto {
  contactId: string;
}

export interface DeleteContactDto {
  actorUserId: string;
  contactId: string;
}

export type CreateContactResultDto = ContactViewDto;
export type UpdateContactResultDto = ContactViewDto;
