import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import { CreateExpirationNotificationPolicyDto } from '@application/dto';
import {
  ExpirationNotificationPolicyAnchor,
  ExpirationNotificationPolicyRepeatUntil,
  ExpirationNotificationPolicyStatus,
  ExpirationNotificationPolicyTriggerMode,
} from '@domain/entities';

class ExpirationNotificationPolicyOffsetRequestDto {
  @Min(0)
  years!: number;

  @Min(0)
  months!: number;

  @Min(0)
  weeks!: number;

  @Min(0)
  days!: number;
}

class ExpirationNotificationPolicyRuleRequestDto {
  @IsOptional()
  @IsString()
  rule_id?: string;

  @IsEnum(ExpirationNotificationPolicyAnchor)
  anchor!: ExpirationNotificationPolicyAnchor;

  @ValidateNested()
  @Type(() => ExpirationNotificationPolicyOffsetRequestDto)
  start_offset!: ExpirationNotificationPolicyOffsetRequestDto;

  @IsEnum(ExpirationNotificationPolicyTriggerMode)
  trigger_mode!: ExpirationNotificationPolicyTriggerMode;

  @IsArray()
  @IsString({ each: true })
  recipient_group_ids!: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ExpirationNotificationPolicyOffsetRequestDto)
  repeat_every?: ExpirationNotificationPolicyOffsetRequestDto;

  @IsOptional()
  @IsEnum(ExpirationNotificationPolicyRepeatUntil)
  repeat_until?: ExpirationNotificationPolicyRepeatUntil;

  @IsOptional()
  @ValidateNested()
  @Type(() => ExpirationNotificationPolicyOffsetRequestDto)
  repeat_for?: ExpirationNotificationPolicyOffsetRequestDto;
}

export class CreateExpirationNotificationPolicyRequestDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ExpirationNotificationPolicyStatus)
  status?: ExpirationNotificationPolicyStatus;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExpirationNotificationPolicyRuleRequestDto)
  rules!: ExpirationNotificationPolicyRuleRequestDto[];

  toDomain(actorUserId: string): CreateExpirationNotificationPolicyDto {
    return {
      actorUserId,
      name: this.name,
      description: this.description ?? null,
      status: this.status ?? ExpirationNotificationPolicyStatus.ACTIVE,
      rules: this.rules.map((rule) => ({
        ruleId: rule.rule_id,
        anchor: rule.anchor,
        startOffset: {
          years: Number(rule.start_offset.years ?? 0),
          months: Number(rule.start_offset.months ?? 0),
          weeks: Number(rule.start_offset.weeks ?? 0),
          days: Number(rule.start_offset.days ?? 0),
        },
        triggerMode: rule.trigger_mode,
        recipientGroupIds: rule.recipient_group_ids,
        repeatEvery: rule.repeat_every
          ? {
              years: Number(rule.repeat_every.years ?? 0),
              months: Number(rule.repeat_every.months ?? 0),
              weeks: Number(rule.repeat_every.weeks ?? 0),
              days: Number(rule.repeat_every.days ?? 0),
            }
          : null,
        repeatUntil: rule.repeat_until ?? null,
        repeatFor: rule.repeat_for
          ? {
              years: Number(rule.repeat_for.years ?? 0),
              months: Number(rule.repeat_for.months ?? 0),
              weeks: Number(rule.repeat_for.weeks ?? 0),
              days: Number(rule.repeat_for.days ?? 0),
            }
          : null,
      })),
    };
  }
}
