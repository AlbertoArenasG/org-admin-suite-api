import {
  PaginatedResultDto,
  PaginationParamsDto,
} from '@application/dto/shared';
import { SortDirection, UserSortField } from '@domain/ports/repositories';
import { UserViewDto } from './create-user.dto';

export interface GetUsersDto extends PaginationParamsDto {
  includeMasterUsers: boolean;
  sortBy: UserSortField;
  sortDirection: SortDirection;
}

export type GetUsersResultDto = PaginatedResultDto<UserViewDto>;
