import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetProvidersDto, GetProvidersResultDto } from '@application/dto';
import { GetProvidersUseCase } from '@application/use-cases';
import { BaseQueryHandler } from '@infra/cqrs/base-query.handler';

export class GetProvidersQuery {
  private constructor(public readonly payload: GetProvidersDto) {}

  static create(payload: GetProvidersDto) {
    return new GetProvidersQuery(payload);
  }
}

@QueryHandler(GetProvidersQuery)
export class GetProvidersHandler
  extends BaseQueryHandler<GetProvidersQuery, GetProvidersResultDto>
  implements IQueryHandler<GetProvidersQuery>
{
  constructor(private readonly useCase: GetProvidersUseCase) {
    super();
  }

  async execute(query: GetProvidersQuery): Promise<GetProvidersResultDto> {
    return this.run(query, () => this.useCase.execute(query.payload));
  }
}
