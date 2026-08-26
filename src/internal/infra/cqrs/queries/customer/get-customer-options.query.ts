import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetCustomerOptionsResultDto } from '@application/dto';
import { GetCustomerOptionsUseCase } from '@application/use-cases';
import { BaseQueryHandler } from '@infra/cqrs/base-query.handler';

export class GetCustomerOptionsQuery {
  static create() {
    return new GetCustomerOptionsQuery();
  }
}

@QueryHandler(GetCustomerOptionsQuery)
export class GetCustomerOptionsHandler
  extends BaseQueryHandler<GetCustomerOptionsQuery, GetCustomerOptionsResultDto>
  implements IQueryHandler<GetCustomerOptionsQuery>
{
  constructor(private readonly useCase: GetCustomerOptionsUseCase) {
    super();
  }

  async execute(
    query: GetCustomerOptionsQuery,
  ): Promise<GetCustomerOptionsResultDto> {
    return this.run(query, () => this.useCase.execute());
  }
}
