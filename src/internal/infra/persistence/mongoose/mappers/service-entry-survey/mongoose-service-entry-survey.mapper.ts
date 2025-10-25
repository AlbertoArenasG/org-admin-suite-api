import { ServiceEntrySurvey } from '@domain/entities';
import { ServiceEntrySurveyDocument } from '@infra/persistence/mongoose/schemas';

export class MongooseServiceEntrySurveyMapper {
  static toDomain(
    document: ServiceEntrySurveyDocument,
  ): ServiceEntrySurvey | null {
    if (!document) return null;

    return new ServiceEntrySurvey({
      id: document.service_entry_survey_id,
      serviceEntryId: document.service_entry_id,
      accessId: document.access_id,
      tokenHash: document.token_hash,
      staffTreatment: document.staff_treatment,
      responseTime: document.response_time,
      appearanceAttitude: document.appearance_attitude,
      documentationDelivery: document.documentation_delivery,
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
      staff_treatment: survey.staffTreatment,
      response_time: survey.responseTime,
      appearance_attitude: survey.appearanceAttitude,
      documentation_delivery: survey.documentationDelivery,
      observations: survey.observations,
    };
  }
}
