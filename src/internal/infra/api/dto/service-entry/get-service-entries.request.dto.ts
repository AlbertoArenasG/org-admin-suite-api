import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { GetServiceEntriesDto } from '@application/dto';
import { PaginationRequestDto } from '@infra/api/dto/shared';

const ALLOWED_SORT_FIELDS = [
  'company_name',
  'contact_name',
  'contact_email',
  'service_order_identifier',
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

export class GetServiceEntriesRequestDto extends PaginationRequestDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SortInstructionDto)
  sort?: SortInstructionDto[];

  @IsOptional()
  @IsString()
  search?: string;

  toDomain(): GetServiceEntriesDto {
    return {
      page: this.getPage(),
      perPage: this.getPerPage(),
      search: this.search ?? null,
      sorts: this.sort?.map((item) => ({
        field: item.field,
        direction: item.direction,
      })) ?? [{ field: 'created_at', direction: 'desc' }],
    };
  }
}
