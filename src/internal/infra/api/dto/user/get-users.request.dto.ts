import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { GetUsersDto } from '@application/dto';
import { PaginationRequestDto } from '@infra/api/dto/shared';

const ALLOWED_SORT_FIELDS = [
  'name',
  'lastname',
  'email',
  'status',
  'role',
  'created_at',
] as const;

type SortField = (typeof ALLOWED_SORT_FIELDS)[number];
type SortDirection = 'asc' | 'desc';

class SortInstructionDto {
  @IsIn(ALLOWED_SORT_FIELDS as unknown as string[])
  field!: SortField;

  @IsIn(['asc', 'desc'])
  direction!: SortDirection;
}

export class GetUsersRequestDto extends PaginationRequestDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SortInstructionDto)
  sort?: SortInstructionDto[];

  @IsOptional()
  @IsString()
  search?: string;

  toDomain(includeMasterUsers: boolean): GetUsersDto {
    return {
      page: this.getPage(),
      perPage: this.getPerPage(),
      includeMasterUsers,
      sorts: this.sort?.map((item) => ({
        field: item.field,
        direction: item.direction,
      })) ?? [
        { field: 'lastname', direction: 'asc' },
        { field: 'name', direction: 'asc' },
      ],
      search: this.search ?? null,
    };
  }
}
