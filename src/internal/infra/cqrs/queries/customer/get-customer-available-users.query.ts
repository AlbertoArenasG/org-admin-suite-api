import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetCustomerAvailableUsersResultDto } from '@application/dto';
import { GetCustomerAvailableUsersUseCase } from '@application/use-cases';
import { BaseQueryHandler } from '@infra/cqrs/base-query.handler';

export class GetCustomerAvailableUsersQuery {
  private constructor(public readonly customerId: string) {}

  static create(customerId: string) {
    return new GetCustomerAvailableUsersQuery(customerId);
  }
}

@QueryHandler(GetCustomerAvailableUsersQuery)
export class GetCustomerAvailableUsersHandler
  extends BaseQueryHandler<
    GetCustomerAvailableUsersQuery,
    GetCustomerAvailableUsersResultDto
  >
  implements IQueryHandler<GetCustomerAvailableUsersQuery>
{
  constructor(private readonly useCase: GetCustomerAvailableUsersUseCase) {
    super();
  }

  async execute(
    query: GetCustomerAvailableUsersQuery,
  ): Promise<GetCustomerAvailableUsersResultDto> {
    return this.run(query, () => this.useCase.execute(query.customerId));
  }
}
