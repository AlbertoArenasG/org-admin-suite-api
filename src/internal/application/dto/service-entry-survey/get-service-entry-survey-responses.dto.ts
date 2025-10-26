import {
  PaginatedResultDto,
  PaginationParamsDto,
} from '@application/dto/shared';
import { ServiceEntrySurveyViewDto } from './service-entry-survey.dto';
import { ServiceEntryViewDto } from '@application/dto/service-entry';

export interface GetServiceEntrySurveyResponsesDto extends PaginationParamsDto {
  from?: Date | null;
  to?: Date | null;
  serviceEntryIds?: string[];
  templateId?: string | null;
  templateVersion?: number | null;
}

export interface ServiceEntrySurveyListItemDto {
  survey: ServiceEntrySurveyViewDto;
  serviceEntry: ServiceEntryViewDto;
}

export type GetServiceEntrySurveyResponsesResultDto =
  PaginatedResultDto<ServiceEntrySurveyListItemDto>;
