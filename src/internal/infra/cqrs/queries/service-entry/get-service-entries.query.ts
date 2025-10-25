import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  GetServiceEntriesDto,
  GetServiceEntriesResultDto,
} from '@application/dto';
import { GetServiceEntriesUseCase } from '@application/use-cases';
import { BaseQueryHandler } from '@infra/cqrs/base-query.handler';

export class GetServiceEntriesQuery {
  private constructor(public readonly payload: GetServiceEntriesDto) {}

  static create(payload: GetServiceEntriesDto) {
    return new GetServiceEntriesQuery(payload);
  }
}

@QueryHandler(GetServiceEntriesQuery)
export class GetServiceEntriesHandler
  extends BaseQueryHandler<GetServiceEntriesQuery, GetServiceEntriesResultDto>
  implements IQueryHandler<GetServiceEntriesQuery>
{
  constructor(private readonly useCase: GetServiceEntriesUseCase) {
    super();
  }

  async execute(
    query: GetServiceEntriesQuery,
  ): Promise<GetServiceEntriesResultDto> {
    return this.run(query, () => this.useCase.execute(query.payload));
  }
}
