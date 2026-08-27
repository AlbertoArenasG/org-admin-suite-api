import {
  PaginatedResultDto,
  PaginationParamsDto,
} from '@application/dto/shared';
import { SystemRole } from '@domain/entities';
import { SortDirection, UserSortField } from '@domain/ports/repositories';
import { UserViewDto } from './create-user.dto';

export enum UserCustomerRelationshipFilter {
  UNASSIGNED = 'UNASSIGNED',
}

export interface GetUsersDto extends PaginationParamsDto {
  actorSystemRole: SystemRole;
  sorts: Array<{ field: UserSortField; direction: SortDirection }>;
  search: string | null;
  isInternalStaff: boolean | null;
  customerId: string | null;
  customerRelationship: UserCustomerRelationshipFilter | null;
}

export type GetUsersResultDto = PaginatedResultDto<UserViewDto>;
