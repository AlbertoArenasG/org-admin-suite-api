import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ProviderPublicAccessViewDto } from '@application/dto';
import { GetProviderPublicAccessUseCase } from '@application/use-cases';
import { BaseQueryHandler } from '@infra/cqrs/base-query.handler';

export class GetProviderPublicAccessQuery {
  private constructor(public readonly providerId: string) {}

  static create(providerId: string) {
    return new GetProviderPublicAccessQuery(providerId);
  }
}

@QueryHandler(GetProviderPublicAccessQuery)
export class GetProviderPublicAccessHandler
  extends BaseQueryHandler<
    GetProviderPublicAccessQuery,
    ProviderPublicAccessViewDto
  >
  implements IQueryHandler<GetProviderPublicAccessQuery>
{
  constructor(private readonly useCase: GetProviderPublicAccessUseCase) {
    super();
  }

  async execute(
    query: GetProviderPublicAccessQuery,
  ): Promise<ProviderPublicAccessViewDto> {
    return this.run(query, () => this.useCase.execute(query.providerId));
  }
}
