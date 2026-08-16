import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetExpirationStatusPolicyCatalogResultDto } from '@application/dto';
import { GetExpirationStatusPolicyCatalogUseCase } from '@application/use-cases';
import { BaseQueryHandler } from '@infra/cqrs/base-query.handler';

export class GetExpirationStatusPolicyCatalogQuery {
  static create() {
    return new GetExpirationStatusPolicyCatalogQuery();
  }
}

@QueryHandler(GetExpirationStatusPolicyCatalogQuery)
export class GetExpirationStatusPolicyCatalogHandler
  extends BaseQueryHandler<
    GetExpirationStatusPolicyCatalogQuery,
    GetExpirationStatusPolicyCatalogResultDto
  >
  implements IQueryHandler<GetExpirationStatusPolicyCatalogQuery>
{
  constructor(
    private readonly useCase: GetExpirationStatusPolicyCatalogUseCase,
  ) {
    super();
  }

  async execute(
    query: GetExpirationStatusPolicyCatalogQuery,
  ): Promise<GetExpirationStatusPolicyCatalogResultDto> {
    return this.run(query, () => this.useCase.execute());
  }
}
