import { Inject, Injectable } from '@nestjs/common';

import {
  GetServiceEntrySurveyStatsDto,
  ServiceEntrySurveyStatsViewDto,
} from '@application/dto';
import {
  IServiceEntrySurveyReadRepository,
  IServiceEntrySurveyReadRepositoryToken,
  IServiceEntrySurveyTemplateReadRepository,
  IServiceEntrySurveyTemplateReadRepositoryToken,
} from '@domain/ports/repositories';
import {
  ServiceEntrySurvey,
  ServiceEntrySurveyQuestionType,
  ServiceEntrySurveyTemplate,
} from '@domain/entities';

@Injectable()
export class GetServiceEntrySurveyStatsUseCase {
  constructor(
    @Inject(IServiceEntrySurveyReadRepositoryToken)
    private readonly surveyReadRepository: IServiceEntrySurveyReadRepository,
    @Inject(IServiceEntrySurveyTemplateReadRepositoryToken)
    private readonly templateReadRepository: IServiceEntrySurveyTemplateReadRepository,
  ) {}

  async execute(
    input: GetServiceEntrySurveyStatsDto,
  ): Promise<ServiceEntrySurveyStatsViewDto> {
    const { data } = await this.surveyReadRepository.findAll({
      from: input.from ?? null,
      to: input.to ?? null,
      serviceEntryIds: input.serviceEntryIds,
      templateId: input.templateId ?? null,
      templateVersion: input.templateVersion ?? null,
      page: null,
      perPage: null,
    });

    const totalResponses = data.length;

    const templateGroups = await this.groupSurveysByTemplate(data);

    const templateStats = Array.from(templateGroups.values()).map((group) => ({
      templateId: group.template.id,
      templateVersion: group.template.version,
      templateName: group.template.name,
      category: group.template.category,
      totalResponses: group.surveys.length,
      questionStats: this.calculateQuestionStats(group.template, group.surveys),
    }));

    return {
      totalResponses,
      range: {
        from: input.from ?? null,
        to: input.to ?? null,
      },
      templates: templateStats,
    };
  }

  private async groupSurveysByTemplate(data: ServiceEntrySurvey[]) {
    const groups = new Map<
      string,
      { template: ServiceEntrySurveyTemplate; surveys: ServiceEntrySurvey[] }
    >();

    for (const survey of data) {
      if (!survey.templateId || survey.templateVersion === null) {
        continue;
      }

      const groupKey = `${survey.templateId}:${survey.templateVersion}`;
      let group = groups.get(groupKey);

      if (!group) {
        const { data: template } =
          await this.templateReadRepository.findByIdAndVersion(
            survey.templateId,
            survey.templateVersion,
          );

        if (!template) {
          continue;
        }

        group = { template, surveys: [] };
        groups.set(groupKey, group);
      }

      group.surveys.push(survey);
    }

    return groups;
  }

  private calculateQuestionStats(
    template: ServiceEntrySurveyTemplate,
    surveys: ServiceEntrySurvey[],
  ) {
    const questionMap = new Map(
      template.questions.map((question) => [question.id, question]),
    );

    const questionStats = new Map<
      string,
      {
        question: (typeof template.questions)[number];
        responseCount: number;
        ratingTotal?: number;
        ratingCount?: number;
        ratingDistribution?: Record<string, number>;
        textResponses?: Array<string | number | boolean | null>;
      }
    >();

    for (const survey of surveys) {
      for (const answer of survey.answers) {
        const question = questionMap.get(answer.questionId);
        if (!question) continue;

        let stats = questionStats.get(question.id);

        if (!stats) {
          stats = {
            question,
            responseCount: 0,
          };
          questionStats.set(question.id, stats);
        }

        stats.responseCount += 1;

        if (question.type === ServiceEntrySurveyQuestionType.RATING) {
          if (!stats.ratingDistribution) {
            stats.ratingDistribution = {};
          }

          const value = typeof answer.value === 'string' ? answer.value : null;

          if (!value) continue;

          stats.ratingDistribution[value] =
            (stats.ratingDistribution[value] ?? 0) + 1;

          const optionIndex = question.options
            ? question.options.findIndex(
                (option) => option.toString() === value.toString(),
              )
            : -1;

          if (optionIndex >= 0) {
            const numericValue = optionIndex + 1;
            stats.ratingTotal = (stats.ratingTotal ?? 0) + numericValue;
            stats.ratingCount = (stats.ratingCount ?? 0) + 1;
          }
        } else if (question.type === ServiceEntrySurveyQuestionType.TEXT) {
          if (!stats.textResponses) {
            stats.textResponses = [];
          }
          stats.textResponses.push(answer.value ?? null);
        } else {
          if (!stats.textResponses) {
            stats.textResponses = [];
          }
          stats.textResponses.push(answer.value ?? null);
        }
      }
    }

    return Array.from(questionStats.values()).map((stats) => ({
      templateId: template.id,
      templateVersion: template.version,
      questionId: stats.question.id,
      questionText: stats.question.text,
      type: stats.question.type,
      responseCount: stats.responseCount,
      averageRating:
        stats.question.type === ServiceEntrySurveyQuestionType.RATING &&
        stats.ratingCount
          ? Number(((stats.ratingTotal ?? 0) / stats.ratingCount).toFixed(2))
          : undefined,
      ratingDistribution:
        stats.question.type === ServiceEntrySurveyQuestionType.RATING
          ? (stats.ratingDistribution ?? {})
          : undefined,
      responses:
        stats.question.type !== ServiceEntrySurveyQuestionType.RATING
          ? (stats.textResponses ?? [])
          : undefined,
    }));
  }
}
