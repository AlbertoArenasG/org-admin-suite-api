import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  GetProviderOptionsDto,
  GetProviderOptionsResultDto,
} from '@application/dto';
import { GetProviderOptionsUseCase } from '@application/use-cases';
import { BaseQueryHandler } from '@infra/cqrs/base-query.handler';

export class GetProviderOptionsQuery {
  private constructor(public readonly payload: GetProviderOptionsDto) {}

  static create(payload: GetProviderOptionsDto) {
    return new GetProviderOptionsQuery(payload);
  }
}

@QueryHandler(GetProviderOptionsQuery)
export class GetProviderOptionsHandler
  extends BaseQueryHandler<GetProviderOptionsQuery, GetProviderOptionsResultDto>
  implements IQueryHandler<GetProviderOptionsQuery>
{
  constructor(private readonly useCase: GetProviderOptionsUseCase) {
    super();
  }

  async execute(query: GetProviderOptionsQuery) {
    return this.run(query, () => this.useCase.execute(query.payload));
  }
}
