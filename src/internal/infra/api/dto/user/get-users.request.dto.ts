import { GetUsersDto } from '@application/dto';
import { PaginationRequestDto } from '@infra/api/dto/shared';
import { IsIn, IsOptional } from 'class-validator';

type SortField = 'name' | 'lastname';
type SortDirection = 'asc' | 'desc';

export class GetUsersRequestDto extends PaginationRequestDto {
  @IsOptional()
  @IsIn(['name', 'lastname'])
  sort_by?: SortField;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sort_direction?: SortDirection;

  toDomain(includeMasterUsers: boolean): GetUsersDto {
    return {
      page: this.getPage(),
      perPage: this.getPerPage(),
      includeMasterUsers,
      sortBy: this.sort_by ?? 'lastname',
      sortDirection: this.sort_direction ?? 'asc',
    };
  }
}
