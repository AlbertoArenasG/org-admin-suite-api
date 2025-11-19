import { ServiceEntrySurvey } from '@domain/entities';

export interface IServiceEntrySurveyWriteRepository {
  create(
    survey: ServiceEntrySurvey,
  ): Promise<{ data: ServiceEntrySurvey | null }>;
}

export const IServiceEntrySurveyWriteRepositoryToken = Symbol(
  'IServiceEntrySurveyWriteRepository',
);
