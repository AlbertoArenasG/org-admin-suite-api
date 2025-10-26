import { ServiceEntrySurveyTemplate } from '@domain/entities';

export interface IServiceEntrySurveyTemplateReadRepository {
  findActiveByCategory(
    category: string | null,
  ): Promise<{ data: ServiceEntrySurveyTemplate | null }>;
  findByIdAndVersion(
    templateId: string,
    version: number,
  ): Promise<{ data: ServiceEntrySurveyTemplate | null }>;
}

export const IServiceEntrySurveyTemplateReadRepositoryToken = Symbol(
  'IServiceEntrySurveyTemplateReadRepository',
);
