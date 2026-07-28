import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  ValidateNested,
  IsEnum,
} from 'class-validator';

import { GetRolesDto } from '@application/dto';
import { RoleScope, RoleStatus, SystemRole } from '@domain/entities';
import { PaginationRequestDto } from '@infra/api/dto/shared';

const ALLOWED_SORT_FIELDS = ['name', 'code', 'status', 'created_at'] as const;

type SortField = (typeof ALLOWED_SORT_FIELDS)[number];
type SortDirection = 'asc' | 'desc';

class SortInstructionDto {
  @IsIn(ALLOWED_SORT_FIELDS as unknown as string[])
  field!: SortField;

  @IsIn(['asc', 'desc'])
  direction!: SortDirection;
}

export class GetRolesRequestDto extends PaginationRequestDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SortInstructionDto)
  sort?: SortInstructionDto[];

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(RoleScope)
  scope?: RoleScope;

  @IsOptional()
  @IsEnum(RoleStatus)
  status?: RoleStatus;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) {
      return true;
    }
    if (value === 'false' || value === false) {
      return false;
    }
    return value;
  })
  @IsBoolean()
  is_system?: boolean;

  toDomain(actorSystemRole: SystemRole): GetRolesDto {
    return {
      actorSystemRole,
      page: this.getPage(),
      perPage: this.getPerPage(),
      search: this.search ?? null,
      scope: this.scope ?? null,
      status: this.status ?? null,
      isSystem: this.is_system ?? null,
      sorts: this.sort?.map((item) => ({
        field: item.field,
        direction: item.direction,
      })) ?? [{ field: 'created_at', direction: 'desc' }],
    };
  }
}
