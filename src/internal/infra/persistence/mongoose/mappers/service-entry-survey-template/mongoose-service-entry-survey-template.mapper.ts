import {
  ServiceEntrySurveyTemplate,
  ServiceEntrySurveyQuestion,
  ServiceEntrySurveyQuestionType,
} from '@domain/entities';
import { ServiceEntrySurveyTemplateDocument } from '@infra/persistence/mongoose/schemas';

export class MongooseServiceEntrySurveyTemplateMapper {
  static toDomain(
    document: ServiceEntrySurveyTemplateDocument,
  ): ServiceEntrySurveyTemplate | null {
    if (!document) return null;

    const questions: ServiceEntrySurveyQuestion[] = document.questions.map(
      (question) => ({
        id: question.question_id,
        text: question.text,
        type: question.type as ServiceEntrySurveyQuestionType,
        required: question.required,
        options: question.options ?? [],
        weight: question.weight ?? 1,
      }),
    );

    return new ServiceEntrySurveyTemplate({
      id: document.template_id,
      name: document.name,
      version: document.version,
      category: document.category ?? null,
      isDefault: document.is_default ?? false,
      questions,
      createdAt: document.createdAt ?? undefined,
      updatedAt: document.updatedAt ?? undefined,
    });
  }
}
