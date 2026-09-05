import { BadRequestException } from '@nestjs/common';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import {
  GetCustomerServiceRecordClientAccessListDto,
  GetCustomerServiceRecordClientAccessOptionsDto,
} from '@application/dto';
import { PaginationRequestDto } from '@infra/api/dto/shared';

const fields = [
  'service_number',
  'received_at',
  'estimated_customer_delivery_at',
] as const;
class SortDto {
  @IsIn(fields) field!: (typeof fields)[number];
  @IsIn(['asc', 'desc']) direction!: 'asc' | 'desc';
}
class FiltersDto {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() customer_id?: string;
  @IsOptional() @IsString() service_type_code?: string;
  @IsOptional() @Matches(/^\d{4}-\d{2}-\d{2}$/) received_at_from?: string;
  @IsOptional() @Matches(/^\d{4}-\d{2}-\d{2}$/) received_at_to?: string;
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  estimated_customer_delivery_at_from?: string;
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  estimated_customer_delivery_at_to?: string;
  protected filters(
    actorUserId: string,
  ): GetCustomerServiceRecordClientAccessOptionsDto {
    validateRanges(this);
    return {
      actorUserId,
      search: this.search ?? null,
      customerId: this.customer_id ?? null,
      serviceTypeCode: this.service_type_code ?? null,
      receivedAtFrom: this.received_at_from ?? null,
      receivedAtTo: this.received_at_to ?? null,
      estimatedCustomerDeliveryAtFrom:
        this.estimated_customer_delivery_at_from ?? null,
      estimatedCustomerDeliveryAtTo:
        this.estimated_customer_delivery_at_to ?? null,
    };
  }
}
export class GetCustomerServiceRecordClientAccessListRequestDto extends PaginationRequestDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SortDto)
  sort?: SortDto[];
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() customer_id?: string;
  @IsOptional() @IsString() service_type_code?: string;
  @IsOptional() @Matches(/^\d{4}-\d{2}-\d{2}$/) received_at_from?: string;
  @IsOptional() @Matches(/^\d{4}-\d{2}-\d{2}$/) received_at_to?: string;
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  estimated_customer_delivery_at_from?: string;
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  estimated_customer_delivery_at_to?: string;
  toDomain(actorUserId: string): GetCustomerServiceRecordClientAccessListDto {
    return {
      ...this.filters(actorUserId),
      page: this.getPage(),
      perPage: this.getPerPage(),
      sorts: this.sort ?? [],
    };
  }
  private filters(actorUserId: string) {
    validateRanges(this);
    return {
      actorUserId,
      search: this.search ?? null,
      customerId: this.customer_id ?? null,
      serviceTypeCode: this.service_type_code ?? null,
      receivedAtFrom: this.received_at_from ?? null,
      receivedAtTo: this.received_at_to ?? null,
      estimatedCustomerDeliveryAtFrom:
        this.estimated_customer_delivery_at_from ?? null,
      estimatedCustomerDeliveryAtTo:
        this.estimated_customer_delivery_at_to ?? null,
    };
  }
}
export class GetCustomerServiceRecordClientAccessCustomerOptionsRequestDto extends FiltersDto {
  toDomain(actorUserId: string) {
    return this.filters(actorUserId);
  }
}
export class GetCustomerServiceRecordClientAccessServiceTypeOptionsRequestDto extends FiltersDto {
  toDomain(actorUserId: string) {
    return this.filters(actorUserId);
  }
}

function validateRanges(value: {
  received_at_from?: string;
  received_at_to?: string;
  estimated_customer_delivery_at_from?: string;
  estimated_customer_delivery_at_to?: string;
}): void {
  const errors: string[] = [];
  for (const prefix of [
    'received_at',
    'estimated_customer_delivery_at',
  ] as const) {
    const from = value[`${prefix}_from`];
    const to = value[`${prefix}_to`];
    if (from && to && from > to)
      errors.push(`${prefix}_from must not be after ${prefix}_to`);
  }
  if (errors.length) throw new BadRequestException(errors);
}
