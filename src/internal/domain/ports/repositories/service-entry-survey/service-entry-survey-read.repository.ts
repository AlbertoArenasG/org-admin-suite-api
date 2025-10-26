import { ServiceEntrySurvey } from '@domain/entities';

export interface FindServiceEntrySurveysParams {
  from?: Date | null;
  to?: Date | null;
  serviceEntryIds?: string[];
}

export interface IServiceEntrySurveyReadRepository {
  findByAccessId(
    accessId: string,
  ): Promise<{ data: ServiceEntrySurvey | null }>;
  findByServiceEntryId(
    serviceEntryId: string,
  ): Promise<{ data: ServiceEntrySurvey | null }>;
  findAll(
    params: FindServiceEntrySurveysParams,
  ): Promise<{ data: ServiceEntrySurvey[] }>;
}

export const IServiceEntrySurveyReadRepositoryToken = Symbol(
  'IServiceEntrySurveyReadRepository',
);
