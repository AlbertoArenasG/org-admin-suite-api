import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import {
  AssociateCustomerUserDto,
  GetCustomerRelatedUsersDto,
} from '@application/dto';
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

class CustomerUserSortInstructionRequestDto {
  @IsIn(ALLOWED_SORT_FIELDS as unknown as string[])
  field!: SortField;

  @IsIn(['asc', 'desc'])
  direction!: SortDirection;
}

export class GetCustomerRelatedUsersRequestDto extends PaginationRequestDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomerUserSortInstructionRequestDto)
  sort?: CustomerUserSortInstructionRequestDto[];

  @IsOptional()
  @IsString()
  search?: string;

  toDomain(customerId: string): GetCustomerRelatedUsersDto {
    return {
      customerId,
      page: this.getPage(),
      perPage: this.getPerPage(),
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

export class AssociateCustomerUserRequestDto {
  @IsNotEmpty()
  @IsString()
  user_id!: string;

  toDomain(customerId: string): AssociateCustomerUserDto {
    return {
      customerId,
      userId: this.user_id,
    };
  }
}
