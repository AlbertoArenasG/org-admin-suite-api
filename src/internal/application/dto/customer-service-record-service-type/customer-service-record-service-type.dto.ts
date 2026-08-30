import { CustomerServiceRecordServiceTypeStatus } from '@domain/entities';
import {
  PaginatedResultDto,
  PaginationParamsDto,
} from '@application/dto/shared';

export interface CustomerServiceRecordServiceTypeDto {
  id: string;
  code: string;
  name: string;
  status: CustomerServiceRecordServiceTypeStatus;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CustomerServiceRecordServiceTypeOptionDto {
  code: string;
  name: string;
}

export interface GetCustomerServiceRecordServiceTypesDto
  extends PaginationParamsDto {
  status: CustomerServiceRecordServiceTypeStatus | null;
}

export interface CreateCustomerServiceRecordServiceTypeDto {
  actorUserId: string;
  name: string;
}

export interface UpdateCustomerServiceRecordServiceTypeDto {
  actorUserId: string;
  serviceTypeId: string;
  status: CustomerServiceRecordServiceTypeStatus;
}

export type GetCustomerServiceRecordServiceTypesResultDto =
  PaginatedResultDto<CustomerServiceRecordServiceTypeDto>;
export type GetCustomerServiceRecordServiceTypeOptionsResultDto =
  CustomerServiceRecordServiceTypeOptionDto[];
export type CreateCustomerServiceRecordServiceTypeResultDto =
  CustomerServiceRecordServiceTypeDto;
export type UpdateCustomerServiceRecordServiceTypeResultDto =
  CustomerServiceRecordServiceTypeDto;
