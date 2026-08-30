import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  CreateCustomerServiceRecordDto,
  GetCustomerServiceRecordsDto,
  UpdateCustomerServiceRecordDto,
} from '@application/dto';
import { CustomerServiceRecordOperationalStatus } from '@domain/entities';
import { PaginationRequestDto } from '@infra/api/dto/shared';

class IntervalRequestDto {
  @IsOptional() @Min(0) years?: number;
  @IsOptional() @Min(0) months?: number;
  @IsOptional() @Min(0) weeks?: number;
  @IsOptional() @Min(0) days?: number;
  toDomain() {
    return {
      years: Number(this.years ?? 0),
      months: Number(this.months ?? 0),
      weeks: Number(this.weeks ?? 0),
      days: Number(this.days ?? 0),
    };
  }
}
class AssetRequestDto {
  @IsString() name!: string;
  @IsString() identifier!: string;
  @IsString() brand!: string;
  @IsString() model!: string;
  @IsString() serial_number!: string;
  @IsOptional() @IsString() observations?: string | null;
  toDomain() {
    return {
      name: this.name,
      identifier: this.identifier,
      brand: this.brand,
      model: this.model,
      serialNumber: this.serial_number,
      observations: this.observations ?? null,
    };
  }
}
class CustomerRequestDto {
  @IsString() customer_id!: string;
  @IsArray() @IsString({ each: true }) customer_user_ids!: string[];
  toDomain() {
    return {
      customerId: this.customer_id,
      customerUserIds: this.customer_user_ids ?? [],
    };
  }
}
class FollowUpRuleRequestDto {
  @ValidateNested()
  @Type(() => IntervalRequestDto)
  interval!: IntervalRequestDto;
  @IsArray() @IsString({ each: true }) recipient_group_ids!: string[];
  @IsArray() @IsString({ each: true }) cc_recipient_group_ids!: string[];
  toDomain() {
    return {
      interval: this.interval.toDomain(),
      recipientGroupIds: this.recipient_group_ids ?? [],
      ccRecipientGroupIds: this.cc_recipient_group_ids ?? [],
    };
  }
}
class FollowUpRequestDto {
  @IsBoolean() enabled!: boolean;
  @ValidateNested({ each: true })
  @Type(() => FollowUpRuleRequestDto)
  rules!: FollowUpRuleRequestDto[];
  toDomain() {
    return {
      enabled: this.enabled,
      rules: (this.rules ?? []).map((rule) => rule.toDomain()),
    };
  }
}
class CustomerDeliveryRequestDto {
  @IsOptional() @Matches(/^\d{4}-\d{2}-\d{2}$/) received_at?: string | null;
  @IsOptional()
  @ValidateNested()
  @Type(() => IntervalRequestDto)
  estimated_delivery_interval?: IntervalRequestDto;
  @IsOptional() @Matches(/^\d{4}-\d{2}-\d{2}$/) estimated_delivery_at?:
    | string
    | null;
  @IsOptional() @Matches(/^\d{4}-\d{2}-\d{2}$/) delivered_to_customer_at?:
    | string
    | null;
  @IsOptional() @IsString() status_policy_id?: string | null;
  @IsOptional() @IsString() notification_policy_id?: string | null;
  toDomain() {
    return {
      ...(this.received_at === undefined
        ? {}
        : { receivedAt: this.received_at }),
      ...(this.estimated_delivery_interval === undefined
        ? {}
        : {
            estimatedDeliveryInterval:
              this.estimated_delivery_interval.toDomain(),
          }),
      ...(this.estimated_delivery_at === undefined
        ? {}
        : { estimatedDeliveryAt: this.estimated_delivery_at }),
      ...(this.delivered_to_customer_at === undefined
        ? {}
        : { deliveredToCustomerAt: this.delivered_to_customer_at }),
      ...(this.status_policy_id === undefined
        ? {}
        : { statusPolicyId: this.status_policy_id }),
      ...(this.notification_policy_id === undefined
        ? {}
        : { notificationPolicyId: this.notification_policy_id }),
    };
  }
}
class ProviderRequestDto {
  @IsString() provider_id!: string;
  @IsOptional() @Matches(/^\d{4}-\d{2}-\d{2}$/) delivered_to_provider_at?:
    | string
    | null;
  @ValidateNested()
  @Type(() => IntervalRequestDto)
  estimated_return_interval!: IntervalRequestDto;
  @IsOptional() @Matches(/^\d{4}-\d{2}-\d{2}$/) estimated_return_at?:
    | string
    | null;
  @IsOptional() @Matches(/^\d{4}-\d{2}-\d{2}$/) returned_from_provider_at?:
    | string
    | null;
  @IsOptional() @IsString() status_policy_id?: string | null;
  @IsOptional() @IsString() notification_policy_id?: string | null;
  @ValidateNested()
  @Type(() => FollowUpRequestDto)
  follow_up!: FollowUpRequestDto;
  toDomain() {
    return {
      providerId: this.provider_id,
      deliveredToProviderAt: this.delivered_to_provider_at ?? null,
      estimatedReturnInterval: this.estimated_return_interval.toDomain(),
      estimatedReturnAt: this.estimated_return_at ?? null,
      returnedFromProviderAt: this.returned_from_provider_at ?? null,
      statusPolicyId: this.status_policy_id ?? null,
      notificationPolicyId: this.notification_policy_id ?? null,
      followUp: this.follow_up.toDomain(),
    };
  }
}

export class CreateCustomerServiceRecordRequestDto {
  @IsString() service_type_code!: string;
  @Matches(/^\d{4}-\d{2}-\d{2}$/) requested_at!: string;
  @IsOptional() @IsString() observations?: string | null;
  @ValidateNested()
  @Type(() => CustomerRequestDto)
  customer!: CustomerRequestDto;
  @ValidateNested({ each: true })
  @Type(() => AssetRequestDto)
  assets!: AssetRequestDto[];
  @ValidateNested()
  @Type(() => CustomerDeliveryRequestDto)
  customer_delivery!: CustomerDeliveryRequestDto;
  @IsOptional()
  @ValidateNested()
  @Type(() => ProviderRequestDto)
  provider?: ProviderRequestDto | null;
  @IsOptional()
  @IsEnum(CustomerServiceRecordOperationalStatus)
  operational_status?: CustomerServiceRecordOperationalStatus;
  toDomain(actorUserId: string): CreateCustomerServiceRecordDto {
    return {
      actorUserId,
      serviceTypeCode: this.service_type_code,
      requestedAt: this.requested_at,
      observations: this.observations ?? null,
      customer: this.customer.toDomain(),
      assets: this.assets.map((asset) => asset.toDomain()),
      customerDelivery: this.customer_delivery.toDomain() as any,
      provider: this.provider ? this.provider.toDomain() : null,
      operationalStatus:
        this.operational_status ??
        CustomerServiceRecordOperationalStatus.PENDING,
    };
  }
}

export class UpdateCustomerServiceRecordRequestDto {
  @IsOptional() @IsString() service_type_code?: string;
  @IsOptional() @Matches(/^\d{4}-\d{2}-\d{2}$/) requested_at?: string;
  @IsOptional() @IsString() observations?: string | null;
  @IsOptional()
  @ValidateNested()
  @Type(() => CustomerRequestDto)
  customer?: CustomerRequestDto;
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => AssetRequestDto)
  assets?: AssetRequestDto[];
  @IsOptional()
  @ValidateNested()
  @Type(() => CustomerDeliveryRequestDto)
  customer_delivery?: CustomerDeliveryRequestDto;
  @IsOptional()
  @ValidateNested()
  @Type(() => ProviderRequestDto)
  provider?: ProviderRequestDto | null;
  @IsOptional()
  @IsEnum(CustomerServiceRecordOperationalStatus)
  operational_status?: CustomerServiceRecordOperationalStatus;
  toDomain(
    recordId: string,
    actorUserId: string,
  ): UpdateCustomerServiceRecordDto {
    return {
      recordId,
      actorUserId,
      ...(this.service_type_code === undefined
        ? {}
        : { serviceTypeCode: this.service_type_code }),
      ...(this.requested_at === undefined
        ? {}
        : { requestedAt: this.requested_at }),
      ...(this.observations === undefined
        ? {}
        : { observations: this.observations }),
      ...(this.customer === undefined
        ? {}
        : { customer: this.customer.toDomain() }),
      ...(this.assets === undefined
        ? {}
        : { assets: this.assets.map((asset) => asset.toDomain()) }),
      ...(this.customer_delivery === undefined
        ? {}
        : { customerDelivery: this.customer_delivery.toDomain() }),
      ...(this.provider === undefined
        ? {}
        : { provider: this.provider ? this.provider.toDomain() : null }),
      ...(this.operational_status === undefined
        ? {}
        : { operationalStatus: this.operational_status }),
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
      sorts: this.sort?.map((item) => ({
        field: item.field,
        direction: item.direction,
      })) ?? [{ field: 'created_at', direction: 'desc' }],
    };
  }
}
