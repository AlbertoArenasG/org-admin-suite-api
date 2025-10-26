import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, IsNumber } from 'class-validator';

import { GetServiceEntrySurveyResponsesDto } from '@application/dto';
import { PaginationRequestDto } from '@infra/api/dto/shared';

export class GetServiceEntrySurveyResponsesRequestDto extends PaginationRequestDto {
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

  toDomain(): GetServiceEntrySurveyResponsesDto {
    const parseDate = (value?: string) =>
      value && !Number.isNaN(new Date(value).getTime())
        ? new Date(value)
        : null;

    return {
      page: this.getPage(),
      perPage: this.getPerPage(),
      from: parseDate(this.from),
      to: parseDate(this.to),
      templateId: this.template_id ?? null,
      templateVersion:
        this.template_version !== undefined &&
        !Number.isNaN(this.template_version)
          ? this.template_version
          : null,
      serviceEntryIds: this.service_entry_ids,
    };
  }
}
