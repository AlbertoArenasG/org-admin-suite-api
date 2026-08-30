import {
  AuditUserDto,
  PaginatedResultDto,
  PaginationParamsDto,
} from '@application/dto/shared';
import { RecipientGroupStatus } from '@domain/entities';
import {
  RecipientGroupSortDirection,
  RecipientGroupSortField,
} from '@domain/ports/repositories';

export interface RecipientGroupChannelDto {
  code: string;
}

export interface RecipientGroupContactSummaryDto {
  id: string;
  userId: string | null;
  isInternalStaff: boolean;
  fullName: string;
  companyNames: string[];
  primaryEmail: string | null;
  primaryCellPhone: string | null;
  status: string;
}

export interface RecipientGroupListItemDto {
  id: string;
  name: string;
  code: string;
  description: string | null;
  enabledChannels: RecipientGroupChannelDto[];
  contactsCount: number;
  status: RecipientGroupStatus;
  createdAt: Date;
  updatedAt?: Date;
}

export interface RecipientGroupViewDto {
  id: string;
  name: string;
  code: string;
  description: string | null;
  enabledChannels: RecipientGroupChannelDto[];
  contacts: RecipientGroupContactSummaryDto[];
  status: RecipientGroupStatus;
  createdBy: AuditUserDto | null;
  updatedBy: AuditUserDto | null;
  createdAt: Date;
  updatedAt?: Date;
}

export interface GetRecipientGroupsDto extends PaginationParamsDto {
  search: string | null;
  status: RecipientGroupStatus | null;
  sorts: Array<{
    field: RecipientGroupSortField;
    direction: RecipientGroupSortDirection;
  }>;
}

export interface RecipientGroupOptionDto {
  id: string;
  code: string;
  name: string;
}

export interface GetRecipientGroupOptionsDto {
  search: string | null;
}

export type GetRecipientGroupsResultDto =
  PaginatedResultDto<RecipientGroupListItemDto>;

export type GetRecipientGroupByIdResultDto = RecipientGroupViewDto;
export type GetRecipientGroupOptionsResultDto = RecipientGroupOptionDto[];

export interface CreateRecipientGroupDto {
  actorUserId: string;
  name: string;
  description: string | null;
  enabledChannels: string[];
  contactIds: string[];
}

export interface UpdateRecipientGroupDto extends CreateRecipientGroupDto {
  recipientGroupId: string;
}

export interface DeleteRecipientGroupDto {
  actorUserId: string;
  recipientGroupId: string;
}

export type CreateRecipientGroupResultDto = RecipientGroupViewDto;
export type UpdateRecipientGroupResultDto = RecipientGroupViewDto;
