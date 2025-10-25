import { ServiceEntrySurveyRating } from '@domain/entities';

export interface SubmitServiceEntrySurveyDto {
  token: string;
  staffTreatment: ServiceEntrySurveyRating;
  responseTime: ServiceEntrySurveyRating;
  appearanceAttitude: ServiceEntrySurveyRating;
  documentationDelivery: ServiceEntrySurveyRating;
  observations?: string | null;
}

export interface ServiceEntrySurveyViewDto {
  id: string;
  serviceEntryId: string;
  accessId: string;
  staffTreatment: ServiceEntrySurveyRating;
  responseTime: ServiceEntrySurveyRating;
  appearanceAttitude: ServiceEntrySurveyRating;
  documentationDelivery: ServiceEntrySurveyRating;
  observations: string | null;
  submittedAt: Date;
}

export interface GetServiceEntrySurveyStatsDto {
  from?: Date | null;
  to?: Date | null;
  serviceEntryIds?: string[];
}

export interface ServiceEntrySurveyStatsViewDto {
  totalResponses: number;
  averageRatings: {
    staffTreatment: number | null;
    responseTime: number | null;
    appearanceAttitude: number | null;
    documentationDelivery: number | null;
  };
  ratingDistribution: Record<ServiceEntrySurveyRating, number>;
}
