import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ServiceEntryCategoryViewDto } from '@application/dto';
import { GetServiceCategoriesUseCase } from '@application/use-cases';
import { BaseQueryHandler } from '@infra/cqrs/base-query.handler';

export class GetServiceCategoriesQuery {
  static create() {
    return new GetServiceCategoriesQuery();
  }
}

@QueryHandler(GetServiceCategoriesQuery)
export class GetServiceCategoriesHandler
  extends BaseQueryHandler<
    GetServiceCategoriesQuery,
    ServiceEntryCategoryViewDto[]
  >
  implements IQueryHandler<GetServiceCategoriesQuery>
{
  constructor(private readonly useCase: GetServiceCategoriesUseCase) {
    super();
  }

  async execute(): Promise<ServiceEntryCategoryViewDto[]> {
    return this.run(null, () => this.useCase.execute());
  }
}
