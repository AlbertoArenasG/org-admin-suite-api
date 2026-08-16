import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetExpirationNotificationPolicyCatalogResultDto } from '@application/dto';
import { GetExpirationNotificationPolicyCatalogUseCase } from '@application/use-cases';
import { BaseQueryHandler } from '@infra/cqrs/base-query.handler';

export class GetExpirationNotificationPolicyCatalogQuery {
  static create() {
    return new GetExpirationNotificationPolicyCatalogQuery();
  }
}

@QueryHandler(GetExpirationNotificationPolicyCatalogQuery)
export class GetExpirationNotificationPolicyCatalogHandler
  extends BaseQueryHandler<
    GetExpirationNotificationPolicyCatalogQuery,
    GetExpirationNotificationPolicyCatalogResultDto
  >
  implements IQueryHandler<GetExpirationNotificationPolicyCatalogQuery>
{
  constructor(
    private readonly useCase: GetExpirationNotificationPolicyCatalogUseCase,
  ) {
    super();
  }

  async execute(
    query: GetExpirationNotificationPolicyCatalogQuery,
  ): Promise<GetExpirationNotificationPolicyCatalogResultDto> {
    return this.run(query, () => this.useCase.execute());
  }
}
