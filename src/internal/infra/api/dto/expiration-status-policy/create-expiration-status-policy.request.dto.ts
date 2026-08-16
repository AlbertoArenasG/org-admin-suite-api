import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import { CreateExpirationStatusPolicyDto } from '@application/dto';
import { ExpirationStatusPolicyStatus } from '@domain/entities';

class ExpirationStatusPolicyOffsetRequestDto {
  @Min(0)
  years!: number;

  @Min(0)
  months!: number;

  @Min(0)
  weeks!: number;

  @Min(0)
  days!: number;
}

class ExpirationStatusPolicyRuleRequestDto {
  @IsOptional()
  @IsString()
  rule_id?: string;

  @ValidateNested()
  @Type(() => ExpirationStatusPolicyOffsetRequestDto)
  start_offset!: ExpirationStatusPolicyOffsetRequestDto;

  @IsNotEmpty()
  @IsString()
  label!: string;

  @Matches(/^#[0-9a-fA-F]{6}$/)
  color_hex!: string;
}

export class CreateExpirationStatusPolicyRequestDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ExpirationStatusPolicyStatus)
  status?: ExpirationStatusPolicyStatus;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExpirationStatusPolicyRuleRequestDto)
  rules!: ExpirationStatusPolicyRuleRequestDto[];

  toDomain(actorUserId: string): CreateExpirationStatusPolicyDto {
    return {
      actorUserId,
      name: this.name,
      description: this.description ?? null,
      status: this.status ?? ExpirationStatusPolicyStatus.ACTIVE,
      rules: this.rules.map((rule) => ({
        ruleId: rule.rule_id,
        startOffset: {
          years: Number(rule.start_offset.years ?? 0),
          months: Number(rule.start_offset.months ?? 0),
          weeks: Number(rule.start_offset.weeks ?? 0),
          days: Number(rule.start_offset.days ?? 0),
        },
        label: rule.label,
        colorHex: rule.color_hex,
      })),
    };
  }
}
