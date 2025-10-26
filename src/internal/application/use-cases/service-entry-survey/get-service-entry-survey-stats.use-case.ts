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
    });

    const totalResponses = data.length;

    const templateCache = new Map<string, ServiceEntrySurveyTemplate | null>();
    const templateKeys = Array.from(
      new Set(
        data
          .filter(
            (survey) => !!survey.templateId && survey.templateVersion !== null,
          )
          .map((survey) => `${survey.templateId}:${survey.templateVersion}`),
      ),
    );

    await Promise.all(
      templateKeys.map(async (key) => {
        if (templateCache.has(key)) return;
        const [templateId, rawVersion] = key.split(':');
        const version = Number(rawVersion);
        const { data: template } =
          await this.templateReadRepository.findByIdAndVersion(
            templateId,
            version,
          );
        templateCache.set(key, template);
      }),
    );

    const questionStats = new Map<
      string,
      {
        templateId: string;
        templateVersion: number;
        questionId: string;
        questionText: string;
        type: ServiceEntrySurveyQuestionType;
        responseCount: number;
        ratingTotal?: number;
        ratingCount?: number;
        ratingDistribution?: Record<string, number>;
        textResponses?: Array<string | number | boolean | null>;
      }
    >();

    for (const survey of data) {
      if (!survey.templateId || survey.templateVersion === null) {
        continue;
      }

      const templateKey = `${survey.templateId}:${survey.templateVersion}`;
      const template = templateCache.get(templateKey);
      if (!template) continue;

      const questionMap = new Map(
        template.questions.map((question) => [question.id, question]),
      );

      for (const answer of survey.answers) {
        const question = questionMap.get(answer.questionId);
        if (!question) continue;

        const statKey = `${template.id}:${template.version}:${question.id}`;
        let stats = questionStats.get(statKey);

        if (!stats) {
          stats = {
            templateId: template.id,
            templateVersion: template.version,
            questionId: question.id,
            questionText: question.text,
            type: question.type,
            responseCount: 0,
          };
          questionStats.set(statKey, stats);
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

    const questionStatsArray = Array.from(questionStats.values()).map(
      (stats) => ({
        templateId: stats.templateId,
        templateVersion: stats.templateVersion,
        questionId: stats.questionId,
        questionText: stats.questionText,
        type: stats.type,
        responseCount: stats.responseCount,
        averageRating:
          stats.type === ServiceEntrySurveyQuestionType.RATING &&
          stats.ratingCount
            ? Number(((stats.ratingTotal ?? 0) / stats.ratingCount).toFixed(2))
            : undefined,
        ratingDistribution:
          stats.type === ServiceEntrySurveyQuestionType.RATING
            ? (stats.ratingDistribution ?? {})
            : undefined,
        responses:
          stats.type !== ServiceEntrySurveyQuestionType.RATING
            ? (stats.textResponses ?? [])
            : undefined,
      }),
    );

    return {
      totalResponses,
      questionStats: questionStatsArray,
    };
  }
}
