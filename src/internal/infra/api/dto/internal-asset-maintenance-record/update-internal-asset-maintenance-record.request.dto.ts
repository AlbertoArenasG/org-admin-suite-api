import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import { UpdateInternalAssetMaintenanceRecordDto } from '@application/dto';
import {
  InternalAssetMaintenanceRecordStatus,
  InternalAssetMaintenanceType,
} from '@domain/entities';

class InternalAssetMaintenanceIntervalRequestDto {
  @Min(0)
  years!: number;

  @Min(0)
  months!: number;

  @Min(0)
  weeks!: number;

  @Min(0)
  days!: number;
}

class InternalAssetMaintenanceProviderRequestDto {
  @IsBoolean()
  sent_to_provider!: boolean;

  @IsOptional()
  @IsString()
  provider_name?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  sent_to_provider_at?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => InternalAssetMaintenanceIntervalRequestDto)
  provider_lead_time?: InternalAssetMaintenanceIntervalRequestDto;

  @IsOptional()
  @IsString()
  provider_notes?: string;
}

class InternalAssetMaintenanceProviderFollowUpRuleRequestDto {
  @ValidateNested()
  @Type(() => InternalAssetMaintenanceIntervalRequestDto)
  offset!: InternalAssetMaintenanceIntervalRequestDto;

  @IsString({ each: true })
  recipient_group_ids!: string[];

  @IsString({ each: true })
  cc_recipient_group_ids!: string[];
}

class InternalAssetMaintenanceProviderFollowUpRequestDto {
  @IsBoolean()
  enabled!: boolean;

  @ValidateNested({ each: true })
  @Type(() => InternalAssetMaintenanceProviderFollowUpRuleRequestDto)
  rules!: InternalAssetMaintenanceProviderFollowUpRuleRequestDto[];
}

export class UpdateInternalAssetMaintenanceRecordRequestDto {
  @IsString()
  asset_name!: string;

  @IsString()
  asset_identifier!: string;

  @IsEnum(InternalAssetMaintenanceType)
  asset_maintenance_type!: InternalAssetMaintenanceType;

  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  last_maintenance_at!: string;

  @ValidateNested()
  @Type(() => InternalAssetMaintenanceIntervalRequestDto)
  interval!: InternalAssetMaintenanceIntervalRequestDto;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  expiration_date?: string;

  @IsOptional()
  @IsString()
  observations?: string;

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
  @ValidateNested()
  @Type(() => InternalAssetMaintenanceProviderRequestDto)
  provider?: InternalAssetMaintenanceProviderRequestDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => InternalAssetMaintenanceProviderFollowUpRequestDto)
  provider_follow_up?: InternalAssetMaintenanceProviderFollowUpRequestDto;

  toDomain(
    recordId: string,
    actorUserId: string,
  ): UpdateInternalAssetMaintenanceRecordDto {
    return {
      recordId,
      actorUserId,
      assetName: this.asset_name,
      assetIdentifier: this.asset_identifier,
      assetMaintenanceType: this.asset_maintenance_type,
      lastMaintenanceAt: this.last_maintenance_at,
      interval: {
        years: Number(this.interval.years ?? 0),
        months: Number(this.interval.months ?? 0),
        weeks: Number(this.interval.weeks ?? 0),
        days: Number(this.interval.days ?? 0),
      },
      expirationDate: this.expiration_date ?? null,
      observations: this.observations ?? null,
      status: this.status ?? InternalAssetMaintenanceRecordStatus.PENDING,
      expirationStatusPolicyId: this.expiration_status_policy_id ?? null,
      expirationNotificationPolicyId:
        this.expiration_notification_policy_id ?? null,
      provider: this.provider
        ? {
            sentToProvider: this.provider.sent_to_provider,
            providerName: this.provider.provider_name ?? null,
            sentToProviderAt: this.provider.sent_to_provider_at ?? null,
            providerLeadTime: this.provider.provider_lead_time
              ? {
                  years: Number(this.provider.provider_lead_time.years ?? 0),
                  months: Number(this.provider.provider_lead_time.months ?? 0),
                  weeks: Number(this.provider.provider_lead_time.weeks ?? 0),
                  days: Number(this.provider.provider_lead_time.days ?? 0),
                }
              : null,
            providerNotes: this.provider.provider_notes ?? null,
          }
        : null,
      providerFollowUp: this.provider_follow_up
        ? {
            enabled: this.provider_follow_up.enabled,
            rules: (this.provider_follow_up.rules ?? []).map((rule) => ({
              offset: {
                years: Number(rule.offset.years ?? 0),
                months: Number(rule.offset.months ?? 0),
                weeks: Number(rule.offset.weeks ?? 0),
                days: Number(rule.offset.days ?? 0),
              },
              recipientGroupIds: rule.recipient_group_ids ?? [],
              ccRecipientGroupIds: rule.cc_recipient_group_ids ?? [],
            })),
            lastSentAt: null,
          }
        : null,
    };
  }
}
