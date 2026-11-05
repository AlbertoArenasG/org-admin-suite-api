import {
  IsArray,
  IsDefined,
  IsEmpty,
  IsIn,
  IsEnum,
  IsInt,
  IsNotEmpty,
  Matches,
  Min,
  IsOptional,
  IsString,
  Validate,
  ValidateNested,
  ValidateIf,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  GetBillingCustomerServiceRecordsDto,
  UpdateBillingCustomerServiceRecordInvoiceDto,
  UpdateBillingCustomerServiceRecordStatusDto,
  UpdateBillingCustomerServiceRecordDetailsDto,
  UpdateBillingCustomerServiceRecordInvoiceStatusDto,
  UpdateBillingCustomerServiceRecordPurchaseOrderDto,
  CreateBillingCustomerServiceRecordPaymentComplementDto,
  UpdateBillingCustomerServiceRecordPaymentComplementDto,
} from '@application/dto/customer-service-record-billing';
import {
  CustomerServiceRecordBillingStatus,
  CustomerServiceRecordInvoiceStatus,
  BillingRecordCommentVisibility,
} from '@domain/entities';
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

export class CreateBillingCustomerServiceRecordCommentRequestDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/)
  text!: string;

  @IsEnum(BillingRecordCommentVisibility)
  visibility!: BillingRecordCommentVisibility;
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

class BillingPaymentTermRequestDto {
  @IsDefined() @IsInt() @Min(0) years!: number;
  @IsDefined() @IsInt() @Min(0) months!: number;
  @IsDefined() @IsInt() @Min(0) weeks!: number;
  @IsDefined() @IsInt() @Min(0) days!: number;
}

@ValidatorConstraint({ name: 'BillingLocalDate' })
class BillingLocalDateValidator implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value))
      return false;
    const parsed = new Date(`${value}T00:00:00.000Z`);
    return (
      !Number.isNaN(parsed.getTime()) &&
      parsed.toISOString().slice(0, 10) === value
    );
  }
  defaultMessage(): string {
    return 'Must be a valid date in YYYY-MM-DD format';
  }
}

export class UpdateBillingCustomerServiceRecordDetailsRequestDto {
  @ValidateIf((_, value) => value !== undefined && value !== null)
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @Validate(BillingLocalDateValidator)
  issued_at?: string | null;
  @ValidateIf((_, value) => value !== undefined && value !== null)
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @Validate(BillingLocalDateValidator)
  delivered_at?: string | null;
  @ValidateIf((_, value) => value !== undefined && value !== null)
  @ValidateNested()
  @Type(() => BillingPaymentTermRequestDto)
  payment_term?: BillingPaymentTermRequestDto | null;
  @ValidateIf((_, value) => value !== undefined && value !== null)
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @Validate(BillingLocalDateValidator)
  estimated_payment_at?: string | null;
  @ValidateIf((_, value) => value !== undefined && value !== null)
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @Validate(BillingLocalDateValidator)
  paid_at?: string | null;

  toDomain(
    recordId: string,
    actorUserId: string,
  ): UpdateBillingCustomerServiceRecordDetailsDto {
    return {
      recordId,
      actorUserId,
      changes: {
        ...(this.issued_at === undefined ? {} : { issuedAt: this.issued_at }),
        ...(this.delivered_at === undefined
          ? {}
          : { deliveredAt: this.delivered_at }),
        ...(this.payment_term === undefined
          ? {}
          : { paymentTerm: this.payment_term }),
        ...(this.estimated_payment_at === undefined
          ? {}
          : { estimatedPaymentAt: this.estimated_payment_at }),
        ...(this.paid_at === undefined ? {} : { paidAt: this.paid_at }),
      },
    };
  }
}

export class UpdateBillingCustomerServiceRecordInvoiceStatusRequestDto {
  @IsDefined()
  @IsEnum(CustomerServiceRecordInvoiceStatus)
  invoice_status!: CustomerServiceRecordInvoiceStatus;

  toDomain(
    recordId: string,
    actorUserId: string,
  ): UpdateBillingCustomerServiceRecordInvoiceStatusDto {
    return { recordId, actorUserId, invoiceStatus: this.invoice_status };
  }
}

export class UpdateBillingCustomerServiceRecordPurchaseOrderRequestDto extends UpdateBillingCustomerServiceRecordInvoiceRequestDto {
  toPurchaseOrderDomain(
    recordId: string,
    actorUserId: string,
  ): UpdateBillingCustomerServiceRecordPurchaseOrderDto {
    return super.toDomain(recordId, actorUserId);
  }
}

export class CreateBillingCustomerServiceRecordPaymentComplementRequestDto {
  @ValidateIf((_, value) => value !== undefined && value !== null)
  @IsString()
  reference_number?: string | null;
  @IsDefined() @IsArray() @IsString({ each: true }) file_ids!: string[];

  toDomain(
    recordId: string,
    actorUserId: string,
  ): CreateBillingCustomerServiceRecordPaymentComplementDto {
    return {
      recordId,
      actorUserId,
      referenceNumber: this.reference_number ?? null,
      fileIds: this.file_ids,
    };
  }
  toUpdateDomain(
    recordId: string,
    complementId: string,
    actorUserId: string,
  ): UpdateBillingCustomerServiceRecordPaymentComplementDto {
    return { ...this.toDomain(recordId, actorUserId), complementId };
  }
}

export class UpdateBillingCustomerServiceRecordPaymentComplementRequestDto extends CreateBillingCustomerServiceRecordPaymentComplementRequestDto {
  @IsDefined()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  reference_number!: string | null;
}
