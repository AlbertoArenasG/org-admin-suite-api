import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDefined,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

import {
  CreateCustomerServiceRecordDto,
  CustomerServiceRecordDocumentType,
  GetCustomerServiceRecordsDto,
  UpdateCustomerServiceRecordAssetDto,
  UpdateCustomerServiceRecordCustomerDto,
  UpdateCustomerServiceRecordDetailsDto,
  UpdateCustomerServiceRecordDocumentDto,
  UpdateCustomerServiceRecordProviderDto,
} from '@application/dto';
import { CustomerServiceRecordOperationalStatus } from '@domain/entities';
import {
  CUSTOMER_SERVICE_RECORD_SORT_STRATEGIES,
  CustomerServiceRecordSortStrategy,
} from '@domain/ports/repositories';
import { PaginationRequestDto } from '@infra/api/dto/shared';

class IntervalRequestDto {
  @IsDefined() @IsInt() @Min(0) years!: number;
  @IsDefined() @IsInt() @Min(0) months!: number;
  @IsDefined() @IsInt() @Min(0) weeks!: number;
  @IsDefined() @IsInt() @Min(0) days!: number;

  toDomain() {
    return {
      years: this.years,
      months: this.months,
      weeks: this.weeks,
      days: this.days,
    };
  }
}

class AssetRequestDto {
  @IsString() name!: string;
  @IsString() identifier!: string;
  @IsString() brand!: string;
  @IsString() model!: string;
  @IsString() serial_number!: string;
  @IsDefined()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  observations!: string | null;

  toAssetDomain() {
    return {
      name: this.name,
      identifier: this.identifier,
      brand: this.brand,
      model: this.model,
      serialNumber: this.serial_number,
      observations: this.observations,
    };
  }
}

class CustomerRequestDto {
  @IsString() customer_id!: string;
  @IsDefined()
  @IsArray()
  @IsString({ each: true })
  customer_user_ids!: string[];

  toDomain() {
    return {
      customerId: this.customer_id,
      customerUserIds: this.customer_user_ids,
    };
  }
}

class FollowUpRuleRequestDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => IntervalRequestDto)
  interval!: IntervalRequestDto;
  @IsDefined()
  @IsArray()
  @IsString({ each: true })
  recipient_group_ids!: string[];
  @IsDefined()
  @IsArray()
  @IsString({ each: true })
  cc_recipient_group_ids!: string[];

  toDomain() {
    return {
      interval: this.interval.toDomain(),
      recipientGroupIds: this.recipient_group_ids,
      ccRecipientGroupIds: this.cc_recipient_group_ids,
    };
  }
}

class FollowUpRequestDto {
  @IsDefined() @IsBoolean() enabled!: boolean;
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FollowUpRuleRequestDto)
  rules!: FollowUpRuleRequestDto[];

  toDomain() {
    return {
      enabled: this.enabled,
      rules: this.rules.map((rule) => rule.toDomain()),
    };
  }
}

class CustomerDeliveryRequestDto {
  @IsDefined()
  @ValidateIf((_, value) => value !== null)
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  received_at!: string | null;
  @IsDefined()
  @ValidateNested()
  @Type(() => IntervalRequestDto)
  estimated_delivery_interval!: IntervalRequestDto;
  @IsDefined()
  @ValidateIf((_, value) => value !== null)
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  estimated_delivery_at!: string | null;
  @IsDefined()
  @ValidateIf((_, value) => value !== null)
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  delivered_to_customer_at!: string | null;
  @IsDefined()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  status_policy_id!: string | null;
  @IsDefined()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  notification_policy_id!: string | null;

  toDomain() {
    return {
      receivedAt: this.received_at,
      estimatedDeliveryInterval: this.estimated_delivery_interval.toDomain(),
      estimatedDeliveryAt: this.estimated_delivery_at,
      deliveredToCustomerAt: this.delivered_to_customer_at,
      statusPolicyId: this.status_policy_id,
      notificationPolicyId: this.notification_policy_id,
    };
  }
}

class ProviderRequestDto {
  @IsString() provider_id!: string;
  @IsDefined()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  work_order_reference!: string | null;
  @IsDefined()
  @ValidateIf((_, value) => value !== null)
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  delivered_to_provider_at!: string | null;
  @IsDefined()
  @ValidateNested()
  @Type(() => IntervalRequestDto)
  estimated_return_interval!: IntervalRequestDto;
  @IsDefined()
  @ValidateIf((_, value) => value !== null)
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  estimated_return_at!: string | null;
  @IsDefined()
  @ValidateIf((_, value) => value !== null)
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  returned_from_provider_at!: string | null;
  @IsDefined()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  status_policy_id!: string | null;
  @IsDefined()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  notification_policy_id!: string | null;
  @IsDefined()
  @ValidateNested()
  @Type(() => FollowUpRequestDto)
  follow_up!: FollowUpRequestDto;

  toDomain() {
    return {
      providerId: this.provider_id,
      workOrderReference: this.work_order_reference,
      deliveredToProviderAt: this.delivered_to_provider_at,
      estimatedReturnInterval: this.estimated_return_interval.toDomain(),
      estimatedReturnAt: this.estimated_return_at,
      returnedFromProviderAt: this.returned_from_provider_at,
      statusPolicyId: this.status_policy_id,
      notificationPolicyId: this.notification_policy_id,
      followUp: this.follow_up.toDomain(),
    };
  }
}

export class CreateCustomerServiceRecordRequestDto {
  @IsString() service_type_code!: string;
  @Matches(/^\d{4}-\d{2}-\d{2}$/) requested_at!: string;
  @IsDefined()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  observations!: string | null;
  @IsDefined()
  @ValidateNested()
  @Type(() => CustomerRequestDto)
  customer!: CustomerRequestDto;
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssetRequestDto)
  assets!: AssetRequestDto[];

  toDomain(actorUserId: string): CreateCustomerServiceRecordDto {
    return {
      actorUserId,
      serviceTypeCode: this.service_type_code,
      requestedAt: this.requested_at,
      observations: this.observations,
      customer: this.customer.toDomain(),
      assets: this.assets.map((asset) => asset.toAssetDomain()),
    };
  }
}

export class UpdateCustomerServiceRecordDetailsRequestDto {
  @IsString() service_type_code!: string;
  @Matches(/^\d{4}-\d{2}-\d{2}$/) requested_at!: string;
  @IsDefined()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  observations!: string | null;
  @IsEnum(CustomerServiceRecordOperationalStatus)
  operational_status!: CustomerServiceRecordOperationalStatus;

  toDomain(
    recordId: string,
    actorUserId: string,
  ): UpdateCustomerServiceRecordDetailsDto {
    return {
      recordId,
      actorUserId,
      serviceTypeCode: this.service_type_code,
      requestedAt: this.requested_at,
      observations: this.observations,
      operationalStatus: this.operational_status,
    };
  }
}

export class UpdateCustomerServiceRecordCustomerRequestDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => CustomerRequestDto)
  customer!: CustomerRequestDto;
  @IsDefined()
  @ValidateNested()
  @Type(() => CustomerDeliveryRequestDto)
  customer_delivery!: CustomerDeliveryRequestDto;

  toDomain(
    recordId: string,
    actorUserId: string,
  ): UpdateCustomerServiceRecordCustomerDto {
    return {
      recordId,
      actorUserId,
      customer: this.customer.toDomain(),
      customerDelivery: this.customer_delivery.toDomain(),
    };
  }
}

export class UpdateCustomerServiceRecordProviderRequestDto {
  @IsDefined()
  @ValidateIf((_, value) => value !== null)
  @ValidateNested()
  @Type(() => ProviderRequestDto)
  provider!: ProviderRequestDto | null;

  toDomain(
    recordId: string,
    actorUserId: string,
  ): UpdateCustomerServiceRecordProviderDto {
    return {
      recordId,
      actorUserId,
      provider: this.provider ? this.provider.toDomain() : null,
    };
  }
}

export class UpdateCustomerServiceRecordAssetRequestDto extends AssetRequestDto {
  @IsDefined()
  @IsArray()
  @IsString({ each: true })
  intake_condition_file_ids!: string[];
  @IsDefined()
  @IsArray()
  @IsString({ each: true })
  delivery_condition_file_ids!: string[];
  @IsDefined() @IsArray() @IsString({ each: true }) report_file_ids!: string[];

  toDomain(
    recordId: string,
    assetId: string,
    actorUserId: string,
  ): UpdateCustomerServiceRecordAssetDto {
    return {
      recordId,
      assetId,
      actorUserId,
      ...super.toAssetDomain(),
      intakeConditionFileIds: this.intake_condition_file_ids,
      deliveryConditionFileIds: this.delivery_condition_file_ids,
      reportFileIds: this.report_file_ids,
    };
  }
}

export class UpdateCustomerServiceRecordDocumentRequestDto {
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  reference_number?: string | null;
  @IsDefined() @IsArray() @IsString({ each: true }) file_ids!: string[];

  toDomain(
    recordId: string,
    documentType: CustomerServiceRecordDocumentType,
    actorUserId: string,
  ): UpdateCustomerServiceRecordDocumentDto {
    return {
      recordId,
      actorUserId,
      documentType,
      ...(this.reference_number === undefined
        ? {}
        : { referenceNumber: this.reference_number }),
      fileIds: this.file_ids,
    };
  }
}

const SORT_FIELDS = [
  'service_number',
  'requested_at',
  'received_at',
  'estimated_customer_delivery_at',
  'provider_estimated_return_at',
  'operational_status',
  'created_at',
] as const;

class SortInstructionRequestDto {
  @IsIn(SORT_FIELDS as unknown as string[])
  field!: (typeof SORT_FIELDS)[number];
  @IsIn(['asc', 'desc']) direction!: 'asc' | 'desc';
}

export class GetCustomerServiceRecordsRequestDto extends PaginationRequestDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SortInstructionRequestDto)
  sort?: SortInstructionRequestDto[];
  @IsOptional()
  @IsIn(CUSTOMER_SERVICE_RECORD_SORT_STRATEGIES)
  sort_strategy?: CustomerServiceRecordSortStrategy;
  @IsOptional() @IsString() search?: string;
  @IsOptional()
  @IsEnum(CustomerServiceRecordOperationalStatus)
  operational_status?: CustomerServiceRecordOperationalStatus;
  @IsOptional() @IsString() service_type_code?: string;
  @IsOptional() @IsString() customer_id?: string;
  @IsOptional() @IsString() customer_user_id?: string;
  @IsOptional() @IsString() provider_id?: string;
  @IsOptional()
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @IsBoolean()
  has_provider?: boolean;
  @IsOptional() @Matches(/^\d{4}-\d{2}-\d{2}$/) requested_at_from?: string;
  @IsOptional() @Matches(/^\d{4}-\d{2}-\d{2}$/) requested_at_to?: string;
  @IsOptional() @Matches(/^\d{4}-\d{2}-\d{2}$/) received_at_from?: string;
  @IsOptional() @Matches(/^\d{4}-\d{2}-\d{2}$/) received_at_to?: string;
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  estimated_customer_delivery_at_from?: string;
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  estimated_customer_delivery_at_to?: string;
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  provider_estimated_return_at_from?: string;
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  provider_estimated_return_at_to?: string;

  toDomain(): GetCustomerServiceRecordsDto {
    return {
      page: this.getPage(),
      perPage: this.getPerPage(),
      search: this.search ?? null,
      operationalStatus: this.operational_status ?? null,
      serviceTypeCode: this.service_type_code ?? null,
      customerId: this.customer_id ?? null,
      customerUserId: this.customer_user_id ?? null,
      providerId: this.provider_id ?? null,
      hasProvider:
        typeof this.has_provider === 'boolean' ? this.has_provider : null,
      requestedAtFrom: this.requested_at_from ?? null,
      requestedAtTo: this.requested_at_to ?? null,
      receivedAtFrom: this.received_at_from ?? null,
      receivedAtTo: this.received_at_to ?? null,
      estimatedCustomerDeliveryAtFrom:
        this.estimated_customer_delivery_at_from ?? null,
      estimatedCustomerDeliveryAtTo:
        this.estimated_customer_delivery_at_to ?? null,
      providerEstimatedReturnAtFrom:
        this.provider_estimated_return_at_from ?? null,
      providerEstimatedReturnAtTo: this.provider_estimated_return_at_to ?? null,
      sortStrategy: this.sort_strategy ?? null,
      sorts:
        this.sort?.map((item) => ({
          field: item.field,
          direction: item.direction,
        })) ?? [],
    };
  }
}
