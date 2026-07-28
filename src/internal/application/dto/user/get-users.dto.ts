import {
  PaginatedResultDto,
  PaginationParamsDto,
} from '@application/dto/shared';
import { SystemRole } from '@domain/entities';
import { SortDirection, UserSortField } from '@domain/ports/repositories';
import { UserViewDto } from './create-user.dto';

export interface GetUsersDto extends PaginationParamsDto {
  actorSystemRole: SystemRole;
  sorts: Array<{ field: UserSortField; direction: SortDirection }>;
  search: string | null;
}

export type GetUsersResultDto = PaginatedResultDto<UserViewDto>;
