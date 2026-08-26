import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  GetCustomerRelatedUsersDto,
  GetCustomerRelatedUsersResultDto,
} from '@application/dto';
import { GetCustomerRelatedUsersUseCase } from '@application/use-cases';
import { BaseQueryHandler } from '@infra/cqrs/base-query.handler';

export class GetCustomerRelatedUsersQuery {
  private constructor(public readonly params: GetCustomerRelatedUsersDto) {}

  static create(params: GetCustomerRelatedUsersDto) {
    return new GetCustomerRelatedUsersQuery(params);
  }
}

@QueryHandler(GetCustomerRelatedUsersQuery)
export class GetCustomerRelatedUsersHandler
  extends BaseQueryHandler<
    GetCustomerRelatedUsersQuery,
    GetCustomerRelatedUsersResultDto
  >
  implements IQueryHandler<GetCustomerRelatedUsersQuery>
{
  constructor(private readonly useCase: GetCustomerRelatedUsersUseCase) {
    super();
  }

  async execute(
    query: GetCustomerRelatedUsersQuery,
  ): Promise<GetCustomerRelatedUsersResultDto> {
    return this.run(query, () => this.useCase.execute(query.params));
  }
}
