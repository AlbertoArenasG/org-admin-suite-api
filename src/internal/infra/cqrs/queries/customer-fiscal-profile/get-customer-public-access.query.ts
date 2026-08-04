import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { CustomerPublicAccessViewDto } from '@application/dto';
import { GetCustomerPublicAccessUseCase } from '@application/use-cases';
import { BaseQueryHandler } from '@infra/cqrs/base-query.handler';

export class GetCustomerPublicAccessQuery {
  private constructor(public readonly customerId: string) {}

  static create(customerId: string) {
    return new GetCustomerPublicAccessQuery(customerId);
  }
}

@QueryHandler(GetCustomerPublicAccessQuery)
export class GetCustomerPublicAccessHandler
  extends BaseQueryHandler<
    GetCustomerPublicAccessQuery,
    CustomerPublicAccessViewDto
  >
  implements IQueryHandler<GetCustomerPublicAccessQuery>
{
  constructor(private readonly useCase: GetCustomerPublicAccessUseCase) {
    super();
  }

  async execute(
    query: GetCustomerPublicAccessQuery,
  ): Promise<CustomerPublicAccessViewDto> {
    return this.run(query, () => this.useCase.execute(query.customerId));
  }
}
