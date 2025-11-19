import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  ValidateNested,
  IsEnum,
} from 'class-validator';

import { GetCustomerFiscalProfilesDto } from '@application/dto';
import { CustomerFiscalProfileStatus, CustomerStatus } from '@domain/entities';
import { PaginationRequestDto } from '@infra/api/dto/shared';

const ALLOWED_SORT_FIELDS = [
  'company_name',
  'client_code',
  'status',
  'customer_status',
  'profile_status',
  'created_at',
  'submitted_at',
] as const;

type SortField = (typeof ALLOWED_SORT_FIELDS)[number];
type SortDirection = 'asc' | 'desc';

class SortInstructionDto {
  @IsIn(ALLOWED_SORT_FIELDS as unknown as string[])
  field!: SortField;

  @IsIn(['asc', 'desc'])
  direction!: SortDirection;
}

export class GetCustomerFiscalProfilesRequestDto extends PaginationRequestDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SortInstructionDto)
  sort?: SortInstructionDto[];

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(CustomerFiscalProfileStatus)
  status?: CustomerFiscalProfileStatus;

  @IsOptional()
  @IsEnum(CustomerStatus)
  customer_status?: CustomerStatus;

  toDomain(): GetCustomerFiscalProfilesDto {
    return {
      page: this.getPage(),
      perPage: this.getPerPage(),
      search: this.search ?? null,
      profileStatus: this.status ?? null,
      customerStatus: this.customer_status ?? null,
      sorts: this.sort?.map((item) => ({
        field: item.field,
        direction: item.direction,
      })) ?? [{ field: 'created_at', direction: 'desc' }],
    };
  }
}
