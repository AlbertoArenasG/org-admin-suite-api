import { IsEnum, IsOptional } from 'class-validator';

import { GetCustomerServiceRecordServiceTypesDto } from '@application/dto';
import { CustomerServiceRecordServiceTypeStatus } from '@domain/entities';
import { PaginationRequestDto } from '@infra/api/dto/shared';

export class GetCustomerServiceRecordServiceTypesRequestDto extends PaginationRequestDto {
  @IsOptional()
  @IsEnum(CustomerServiceRecordServiceTypeStatus)
  status?: CustomerServiceRecordServiceTypeStatus;

  toDomain(): GetCustomerServiceRecordServiceTypesDto {
    return {
      page: this.getPage(),
      perPage: this.getPerPage(),
      status: this.status ?? null,
    };
  }
}
