import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  GetServiceEntrySurveyResponsesDto,
  GetServiceEntrySurveyResponsesResultDto,
} from '@application/dto';
import { GetServiceEntrySurveyResponsesUseCase } from '@application/use-cases';
import { BaseQueryHandler } from '@infra/cqrs/base-query.handler';

export class GetServiceEntrySurveyResponsesQuery {
  private constructor(
    public readonly payload: GetServiceEntrySurveyResponsesDto,
  ) {}

  static create(payload: GetServiceEntrySurveyResponsesDto) {
    return new GetServiceEntrySurveyResponsesQuery(payload);
  }
}

@QueryHandler(GetServiceEntrySurveyResponsesQuery)
export class GetServiceEntrySurveyResponsesHandler
  extends BaseQueryHandler<
    GetServiceEntrySurveyResponsesQuery,
    GetServiceEntrySurveyResponsesResultDto
  >
  implements IQueryHandler<GetServiceEntrySurveyResponsesQuery>
{
  constructor(private readonly useCase: GetServiceEntrySurveyResponsesUseCase) {
    super();
  }

  async execute(
    query: GetServiceEntrySurveyResponsesQuery,
  ): Promise<GetServiceEntrySurveyResponsesResultDto> {
    return this.run(query, () => this.useCase.execute(query.payload));
  }
}
