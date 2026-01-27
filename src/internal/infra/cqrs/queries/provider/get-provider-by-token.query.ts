import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ProviderViewDto } from '@application/dto';
import { GetProviderByTokenUseCase } from '@application/use-cases';
import { BaseQueryHandler } from '@infra/cqrs/base-query.handler';

export class GetProviderByTokenQuery {
  private constructor(public readonly token: string) {}

  static create(token: string) {
    return new GetProviderByTokenQuery(token);
  }
}

@QueryHandler(GetProviderByTokenQuery)
export class GetProviderByTokenHandler
  extends BaseQueryHandler<GetProviderByTokenQuery, ProviderViewDto>
  implements IQueryHandler<GetProviderByTokenQuery>
{
  constructor(private readonly useCase: GetProviderByTokenUseCase) {
    super();
  }

  async execute(query: GetProviderByTokenQuery): Promise<ProviderViewDto> {
    return this.run(query, () => this.useCase.execute(query.token));
  }
}
