import { IsIn, IsOptional, IsString } from 'class-validator';
import { GetBillingCustomerServiceRecordsDto } from '@application/dto/customer-service-record-billing';
import { CustomerServiceRecordBillingStatus } from '@domain/entities';
import { PaginationRequestDto } from '@infra/api/dto/shared';

export class GetBillingCustomerServiceRecordsRequestDto extends PaginationRequestDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn([
    CustomerServiceRecordBillingStatus.SUBMITTED,
    CustomerServiceRecordBillingStatus.INVOICED,
  ])
  billing_status?:
    | CustomerServiceRecordBillingStatus.SUBMITTED
    | CustomerServiceRecordBillingStatus.INVOICED;

  toDomain(): GetBillingCustomerServiceRecordsDto {
    return {
      page: this.getPage(),
      perPage: this.getPerPage(),
      search: this.search ?? null,
      billingStatus: this.billing_status ?? null,
    };
  }
}
