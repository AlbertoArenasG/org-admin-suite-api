import {
  PaginatedResultDto,
  PaginationParamsDto,
} from '@application/dto/shared';
import { SortDirection, UserSortField } from '@domain/ports/repositories';

import { UserViewDto } from './create-user.dto';

export interface GetCustomerRelatedUsersDto extends PaginationParamsDto {
  customerId: string;
  sorts: Array<{ field: UserSortField; direction: SortDirection }>;
  search: string | null;
}

export type GetCustomerRelatedUsersResultDto = PaginatedResultDto<UserViewDto>;

export interface UserLookupDto {
  id: string;
  name: string;
  lastname: string;
  fullName: string;
  email: string;
}

export type GetCustomerAvailableUsersResultDto = UserLookupDto[];

export interface AssociateCustomerUserDto {
  customerId: string;
  userId: string;
}

export type AssociateCustomerUserResultDto = UserViewDto;

export interface DisassociateCustomerUserDto {
  customerId: string;
  userId: string;
}

export type DisassociateCustomerUserResultDto = UserViewDto;
