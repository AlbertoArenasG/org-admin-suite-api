import {
  ServiceEntrySurvey,
  ServiceEntrySurveyAnswer,
  ServiceEntrySurveyQuestionType,
} from '@domain/entities';
import { ServiceEntrySurveyDocument } from '@infra/persistence/mongoose/schemas';

export class MongooseServiceEntrySurveyMapper {
  static toDomain(
    document: ServiceEntrySurveyDocument,
  ): ServiceEntrySurvey | null {
    if (!document) return null;

    const answers: ServiceEntrySurveyAnswer[] = document.answers.map(
      (answer) => ({
        questionId: answer.question_id,
        type: answer.type,
        value: answer.value ?? null,
      }),
    );

    return new ServiceEntrySurvey({
      id: document.service_entry_survey_id,
      serviceEntryId: document.service_entry_id,
      accessId: document.access_id,
      tokenHash: document.token_hash,
      templateId: document.template_id,
      templateVersion: document.template_version,
      answers,
      observations: document.observations ?? null,
      submittedAt: document.createdAt ?? undefined,
      updatedAt: document.updatedAt ?? undefined,
    });
  }

  static toMongoose(survey: ServiceEntrySurvey) {
    return {
      service_entry_survey_id: survey.id,
      service_entry_id: survey.serviceEntryId,
      access_id: survey.accessId,
      token_hash: survey.tokenHash,
      template_id: survey.templateId,
      template_version: survey.templateVersion,
      answers: survey.answers.map((answer) => ({
        question_id: answer.questionId,
        value: answer.value ?? null,
        type: answer.type as ServiceEntrySurveyQuestionType,
      })),
      observations: survey.observations,
    };
  }
}
