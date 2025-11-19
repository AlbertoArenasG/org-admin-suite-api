import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { CustomerFiscalProfileViewDto } from '@application/dto';
import { GetCustomerFiscalProfileByTokenUseCase } from '@application/use-cases';
import { BaseQueryHandler } from '@infra/cqrs/base-query.handler';

export class GetCustomerFiscalProfileByTokenQuery {
  private constructor(public readonly token: string) {}

  static create(token: string) {
    return new GetCustomerFiscalProfileByTokenQuery(token);
  }
}

@QueryHandler(GetCustomerFiscalProfileByTokenQuery)
export class GetCustomerFiscalProfileByTokenHandler
  extends BaseQueryHandler<
    GetCustomerFiscalProfileByTokenQuery,
    CustomerFiscalProfileViewDto
  >
  implements IQueryHandler<GetCustomerFiscalProfileByTokenQuery>
{
  constructor(
    private readonly useCase: GetCustomerFiscalProfileByTokenUseCase,
  ) {
    super();
  }

  async execute(
    query: GetCustomerFiscalProfileByTokenQuery,
  ): Promise<CustomerFiscalProfileViewDto> {
    return this.run(query, () => this.useCase.execute(query.token));
  }
}
