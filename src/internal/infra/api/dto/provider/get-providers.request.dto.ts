import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  ValidateNested,
  IsEnum,
} from 'class-validator';

import { GetProvidersDto } from '@application/dto';
import {
  ProviderStatus,
  ProviderFiscalProfileStatus,
  ProviderBankingInfoStatus,
} from '@domain/entities';
import { PaginationRequestDto } from '@infra/api/dto/shared';

const ALLOWED_SORT_FIELDS = [
  'company_name',
  'provider_code',
  'provider_status',
  'fiscal_profile_status',
  'banking_info_status',
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

export class GetProvidersRequestDto extends PaginationRequestDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SortInstructionDto)
  sort?: SortInstructionDto[];

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(ProviderStatus)
  status?: ProviderStatus;

  @IsOptional()
  @IsEnum(ProviderFiscalProfileStatus)
  fiscal_profile_status?: ProviderFiscalProfileStatus;

  @IsOptional()
  @IsEnum(ProviderBankingInfoStatus)
  banking_info_status?: ProviderBankingInfoStatus;

  toDomain(): GetProvidersDto {
    return {
      page: this.getPage(),
      perPage: this.getPerPage(),
      search: this.search ?? null,
      status: this.status ?? null,
      fiscalProfileStatus: this.fiscal_profile_status ?? null,
      bankingInfoStatus: this.banking_info_status ?? null,
      sorts: this.sort?.map((item) => ({
        field: item.field,
        direction: item.direction,
      })) ?? [{ field: 'created_at', direction: 'desc' }],
    };
  }
}
