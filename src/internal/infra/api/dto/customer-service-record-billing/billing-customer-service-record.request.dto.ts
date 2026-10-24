import {
  IsArray,
  IsDefined,
  IsEmpty,
  IsIn,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import {
  GetBillingCustomerServiceRecordsDto,
  UpdateBillingCustomerServiceRecordInvoiceDto,
  UpdateBillingCustomerServiceRecordStatusDto,
} from '@application/dto/customer-service-record-billing';
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

export class UpdateBillingCustomerServiceRecordStatusRequestDto {
  @IsDefined()
  @IsIn([
    CustomerServiceRecordBillingStatus.SUBMITTED,
    CustomerServiceRecordBillingStatus.INVOICED,
  ])
  billing_status!:
    | CustomerServiceRecordBillingStatus.SUBMITTED
    | CustomerServiceRecordBillingStatus.INVOICED;

  toDomain(
    recordId: string,
    actorUserId: string,
  ): UpdateBillingCustomerServiceRecordStatusDto {
    return { recordId, actorUserId, billingStatus: this.billing_status };
  }
}

export class UpdateBillingCustomerServiceRecordInvoiceRequestDto {
  @IsDefined()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  reference_number!: string | null;

  @IsDefined()
  @IsArray()
  @IsString({ each: true })
  file_ids!: string[];

  @IsEmpty()
  document_type?: never;

  @IsEmpty()
  documentType?: never;

  toDomain(
    recordId: string,
    actorUserId: string,
  ): UpdateBillingCustomerServiceRecordInvoiceDto {
    return {
      recordId,
      actorUserId,
      referenceNumber: this.reference_number,
      fileIds: this.file_ids,
    };
  }
}
