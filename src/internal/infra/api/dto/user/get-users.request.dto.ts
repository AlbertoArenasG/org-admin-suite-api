import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { GetUsersDto, UserCustomerRelationshipFilter } from '@application/dto';
import {
  InvalidValueException,
  InvalidValueExceptionCode,
} from '@domain/exceptions';
import { SystemRole } from '@domain/entities';
import { PaginationRequestDto } from '@infra/api/dto/shared';

const ALLOWED_SORT_FIELDS = [
  'name',
  'lastname',
  'email',
  'status',
  'system_role',
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

  @IsOptional()
  @IsString()
  customer_id?: string;

  @IsOptional()
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @IsBoolean()
  is_internal_staff?: boolean;

  @IsOptional()
  @IsIn([UserCustomerRelationshipFilter.UNASSIGNED])
  customer_relationship?: UserCustomerRelationshipFilter;

  toDomain(actorSystemRole: SystemRole): GetUsersDto {
    if (
      this.customer_id !== undefined &&
      this.customer_relationship !== undefined
    ) {
      throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
        fields: ['customer_id', 'customer_relationship'],
      });
    }

    return {
      page: this.getPage(),
      perPage: this.getPerPage(),
      actorSystemRole,
      sorts: this.sort?.map((item) => ({
        field: item.field,
        direction: item.direction,
      })) ?? [
        { field: 'lastname', direction: 'asc' },
        { field: 'name', direction: 'asc' },
      ],
      search: this.search ?? null,
      isInternalStaff: this.is_internal_staff ?? null,
      customerId: this.customer_id ?? null,
      customerRelationship: this.customer_relationship ?? null,
    };
  }
}
