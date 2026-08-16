import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

import { GetInternalAssetMaintenanceRecordsDto } from '@application/dto';
import {
  InternalAssetMaintenanceRecordStatus,
  InternalAssetMaintenanceType,
} from '@domain/entities';
import { PaginationRequestDto } from '@infra/api/dto/shared';

const ALLOWED_SORT_FIELDS = [
  'asset_name',
  'asset_identifier',
  'last_maintenance_at',
  'expiration_date',
  'status',
  'created_at',
] as const;
type SortField = (typeof ALLOWED_SORT_FIELDS)[number];
type SortDirection = 'asc' | 'desc';

class SortInstructionDto {
  @IsIn(ALLOWED_SORT_FIELDS as unknown as string[])
  field!: SortField;

  @IsIn(['asc', 'desc'])
  direction!: SortDirection;
}

export class GetInternalAssetMaintenanceRecordsRequestDto extends PaginationRequestDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SortInstructionDto)
  sort?: SortInstructionDto[];

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(InternalAssetMaintenanceType)
  asset_maintenance_type?: InternalAssetMaintenanceType;

  @IsOptional()
  @IsEnum(InternalAssetMaintenanceRecordStatus)
  status?: InternalAssetMaintenanceRecordStatus;

  @IsOptional()
  @IsString()
  expiration_status_policy_id?: string;

  @IsOptional()
  @IsString()
  expiration_notification_policy_id?: string;

  @IsOptional()
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @IsBoolean()
  sent_to_provider?: boolean;

  toDomain(): GetInternalAssetMaintenanceRecordsDto {
    return {
      page: this.getPage(),
      perPage: this.getPerPage(),
      search: this.search ?? null,
      assetMaintenanceType: this.asset_maintenance_type ?? null,
      status: this.status ?? null,
      expirationStatusPolicyId: this.expiration_status_policy_id ?? null,
      expirationNotificationPolicyId:
        this.expiration_notification_policy_id ?? null,
      sentToProvider:
        typeof this.sent_to_provider === 'boolean'
          ? this.sent_to_provider
          : null,
      sorts: this.sort?.map((item) => ({
        field: item.field,
        direction: item.direction,
      })) ?? [{ field: 'created_at', direction: 'desc' }],
    };
  }
}
