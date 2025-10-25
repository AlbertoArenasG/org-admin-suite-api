import { ServiceEntrySurvey } from '@domain/entities';

export interface CreateServiceEntrySurveyParams {
  survey: ServiceEntrySurvey;
}

export interface FindServiceEntrySurveyParams {
  serviceEntryId?: string;
  accessId?: string;
  tokenHash: string;
}

export interface IServiceEntrySurveyRepository {
  create(
    survey: ServiceEntrySurvey,
  ): Promise<{ data: ServiceEntrySurvey | null }>;
  findByTokenHash(
    tokenHash: string,
  ): Promise<{ data: ServiceEntrySurvey | null }>;
  findByServiceEntryId(
    serviceEntryId: string,
  ): Promise<{ data: ServiceEntrySurvey | null }>;
  findAll(params: {
    from?: Date | null;
    to?: Date | null;
    serviceEntryIds?: string[];
  }): Promise<{ data: ServiceEntrySurvey[] }>;
}

export const IServiceEntrySurveyRepositoryToken = Symbol(
  'IServiceEntrySurveyRepository',
);
