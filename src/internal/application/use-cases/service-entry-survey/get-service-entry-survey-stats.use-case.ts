import { Inject, Injectable } from '@nestjs/common';

import {
  GetServiceEntrySurveyStatsDto,
  ServiceEntrySurveyStatsViewDto,
} from '@application/dto';
import {
  IServiceEntrySurveyRepository,
  IServiceEntrySurveyRepositoryToken,
} from '@domain/ports/repositories';
import { ServiceEntrySurveyRating } from '@domain/entities';

const ratingWeights: Record<ServiceEntrySurveyRating, number> = {
  [ServiceEntrySurveyRating.EXCELLENT]: 5,
  [ServiceEntrySurveyRating.VERY_GOOD]: 4,
  [ServiceEntrySurveyRating.GOOD]: 3,
  [ServiceEntrySurveyRating.REGULAR]: 2,
  [ServiceEntrySurveyRating.BAD]: 1,
};

@Injectable()
export class GetServiceEntrySurveyStatsUseCase {
  constructor(
    @Inject(IServiceEntrySurveyRepositoryToken)
    private readonly surveyRepository: IServiceEntrySurveyRepository,
  ) {}

  async execute(
    input: GetServiceEntrySurveyStatsDto,
  ): Promise<ServiceEntrySurveyStatsViewDto> {
    const { data } = await this.surveyRepository.findAll({
      from: input.from ?? null,
      to: input.to ?? null,
      serviceEntryIds: input.serviceEntryIds,
    });

    const ratingDistribution: Record<ServiceEntrySurveyRating, number> = {
      [ServiceEntrySurveyRating.EXCELLENT]: 0,
      [ServiceEntrySurveyRating.VERY_GOOD]: 0,
      [ServiceEntrySurveyRating.GOOD]: 0,
      [ServiceEntrySurveyRating.REGULAR]: 0,
      [ServiceEntrySurveyRating.BAD]: 0,
    };

    let staffTotal = 0;
    let responseTotal = 0;
    let appearanceTotal = 0;
    let documentationTotal = 0;

    for (const survey of data) {
      staffTotal += ratingWeights[survey.staffTreatment];
      responseTotal += ratingWeights[survey.responseTime];
      appearanceTotal += ratingWeights[survey.appearanceAttitude];
      documentationTotal += ratingWeights[survey.documentationDelivery];

      ratingDistribution[survey.staffTreatment] += 1;
      ratingDistribution[survey.responseTime] += 1;
      ratingDistribution[survey.appearanceAttitude] += 1;
      ratingDistribution[survey.documentationDelivery] += 1;
    }

    const totalResponses = data.length;

    const safeAverage = (total: number) =>
      totalResponses > 0 ? Number((total / totalResponses).toFixed(2)) : null;

    return {
      totalResponses,
      averageRatings: {
        staffTreatment: safeAverage(staffTotal),
        responseTime: safeAverage(responseTotal),
        appearanceAttitude: safeAverage(appearanceTotal),
        documentationDelivery: safeAverage(documentationTotal),
      },
      ratingDistribution,
    };
  }
}
