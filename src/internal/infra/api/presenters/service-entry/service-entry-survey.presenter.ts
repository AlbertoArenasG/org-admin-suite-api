import { Injectable } from '@nestjs/common';

import { ServiceEntrySurveyViewDto } from '@application/dto';

@Injectable()
export class ServiceEntrySurveyPresenter {
  toSurveyResponse(survey: ServiceEntrySurveyViewDto) {
    return {
      survey_id: survey.id,
      service_entry_id: survey.serviceEntryId,
      access_id: survey.accessId,
      template: {
        template_id: survey.templateId,
        version: survey.templateVersion,
      },
      answers: survey.answers.map((answer) => ({
        question_id: answer.questionId,
        type: answer.type,
        value: answer.value,
      })),
      observations: survey.observations ?? null,
      submitted_at: survey.submittedAt,
    };
  }
}
