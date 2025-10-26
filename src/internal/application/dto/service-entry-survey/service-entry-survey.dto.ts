import { ServiceEntrySurveyQuestionType } from '@domain/entities';

export interface SubmitServiceEntrySurveyDto {
  token: string;
  answers: Array<{
    questionId: string;
    type: ServiceEntrySurveyQuestionType;
    value: string | number | boolean | null;
  }>;
  observations?: string | null;
}

export interface ServiceEntrySurveyViewDto {
  id: string;
  serviceEntryId: string;
  accessId: string;
  templateId: string;
  templateVersion: number;
  answers: Array<{
    questionId: string;
    type: ServiceEntrySurveyQuestionType;
    value: string | number | boolean | null;
  }>;
  observations: string | null;
  submittedAt: Date;
}

export interface GetServiceEntrySurveyStatsDto {
  from?: Date | null;
  to?: Date | null;
  serviceEntryIds?: string[];
  templateId?: string | null;
  templateVersion?: number | null;
}

export interface ServiceEntrySurveyQuestionStatsViewDto {
  templateId: string;
  templateVersion: number;
  questionId: string;
  questionText: string;
  type: ServiceEntrySurveyQuestionType;
  responseCount: number;
  averageRating?: number | null;
  ratingDistribution?: Record<string, number>;
  responses?: Array<string | number | boolean | null>;
}

export interface ServiceEntrySurveyTemplateStatsViewDto {
  templateId: string;
  templateVersion: number;
  templateName: string;
  category: string | null;
  totalResponses: number;
  questionStats: ServiceEntrySurveyQuestionStatsViewDto[];
}

export interface ServiceEntrySurveyStatsViewDto {
  totalResponses: number;
  range: {
    from: Date | null;
    to: Date | null;
  };
  templates: ServiceEntrySurveyTemplateStatsViewDto[];
}
