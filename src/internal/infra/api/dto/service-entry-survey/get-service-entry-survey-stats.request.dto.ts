import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, IsNumber } from 'class-validator';

import { GetServiceEntrySurveyStatsDto } from '@application/dto';

export class GetServiceEntrySurveyStatsRequestDto {
  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;

  @IsOptional()
  @IsString()
  template_id?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  template_version?: number;

  @IsOptional()
  @IsArray()
  @Type(() => String)
  @IsString({ each: true })
  service_entry_ids?: string[];

  toDomain(): GetServiceEntrySurveyStatsDto {
    const parseDate = (value?: string) =>
      value && !Number.isNaN(new Date(value).getTime())
        ? new Date(value)
        : null;

    return {
      from: parseDate(this.from),
      to: parseDate(this.to),
      serviceEntryIds: this.service_entry_ids,
      templateId: this.template_id ?? null,
      templateVersion:
        this.template_version !== undefined &&
        !Number.isNaN(this.template_version)
          ? this.template_version
          : null,
    };
  }
}
