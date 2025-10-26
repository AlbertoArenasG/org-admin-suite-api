import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  GetServiceEntrySurveyStatsDto,
  ServiceEntrySurveyStatsViewDto,
} from '@application/dto';
import { GetServiceEntrySurveyStatsUseCase } from '@application/use-cases';
import { BaseQueryHandler } from '@infra/cqrs/base-query.handler';

export class GetServiceEntrySurveyStatsQuery {
  private constructor(public readonly payload: GetServiceEntrySurveyStatsDto) {}

  static create(payload: GetServiceEntrySurveyStatsDto) {
    return new GetServiceEntrySurveyStatsQuery(payload);
  }
}

@QueryHandler(GetServiceEntrySurveyStatsQuery)
export class GetServiceEntrySurveyStatsHandler
  extends BaseQueryHandler<
    GetServiceEntrySurveyStatsQuery,
    ServiceEntrySurveyStatsViewDto
  >
  implements IQueryHandler<GetServiceEntrySurveyStatsQuery>
{
  constructor(private readonly useCase: GetServiceEntrySurveyStatsUseCase) {
    super();
  }

  async execute(
    query: GetServiceEntrySurveyStatsQuery,
  ): Promise<ServiceEntrySurveyStatsViewDto> {
    return this.run(query, () => this.useCase.execute(query.payload));
  }
}
