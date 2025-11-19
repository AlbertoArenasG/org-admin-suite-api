import { Injectable } from '@nestjs/common';

import {
  ServiceEntrySurveyStatsViewDto,
  ServiceEntrySurveyViewDto,
} from '@application/dto';
import { EnumNameService } from '@infra/i18n/services';

@Injectable()
export class ServiceEntrySurveyPresenter {
  constructor(private readonly enumNameService: EnumNameService) {}

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

  toSurveyStatsResponse(stats: ServiceEntrySurveyStatsViewDto) {
    return {
      total_responses: stats.totalResponses,
      range: {
        from: stats.range.from ?? null,
        to: stats.range.to ?? null,
      },
      templates: stats.templates.map((template) => ({
        template_id: template.templateId,
        template_version: template.templateVersion,
        template_name: template.templateName,
        category_id: template.category,
        category_name: template.category
          ? this.enumNameService.getEnumName(
              `SERVICE_ENTRY.CATEGORY.${template.category}`,
            )
          : null,
        total_responses: template.totalResponses,
        question_stats: template.questionStats.map((question) => ({
          question_id: question.questionId,
          question_text: question.questionText,
          type: question.type,
          response_count: question.responseCount,
          average_rating: question.averageRating ?? null,
          rating_distribution: question.ratingDistribution ?? null,
          responses: question.responses ?? [],
        })),
      })),
    };
  }
}
