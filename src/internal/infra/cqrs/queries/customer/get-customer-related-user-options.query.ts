import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { UserLookupDto } from '@application/dto';
import { GetCustomerRelatedUserOptionsUseCase } from '@application/use-cases';
import { BaseQueryHandler } from '@infra/cqrs/base-query.handler';

export class GetCustomerRelatedUserOptionsQuery {
  private constructor(
    public readonly customerId: string,
    public readonly search: string | null,
  ) {}

  static create(customerId: string, search: string | null) {
    return new GetCustomerRelatedUserOptionsQuery(customerId, search);
  }
}

@QueryHandler(GetCustomerRelatedUserOptionsQuery)
export class GetCustomerRelatedUserOptionsHandler
  extends BaseQueryHandler<GetCustomerRelatedUserOptionsQuery, UserLookupDto[]>
  implements IQueryHandler<GetCustomerRelatedUserOptionsQuery>
{
  constructor(private readonly useCase: GetCustomerRelatedUserOptionsUseCase) {
    super();
  }

  async execute(query: GetCustomerRelatedUserOptionsQuery) {
    return this.run(query, () =>
      this.useCase.execute(query.customerId, query.search),
    );
  }
}
