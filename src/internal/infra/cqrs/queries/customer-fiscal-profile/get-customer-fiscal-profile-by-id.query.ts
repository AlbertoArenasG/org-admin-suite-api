import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { CustomerFiscalProfileViewDto } from '@application/dto';
import { GetCustomerFiscalProfileByIdUseCase } from '@application/use-cases';
import { BaseQueryHandler } from '@infra/cqrs/base-query.handler';

export class GetCustomerFiscalProfileByIdQuery {
  private constructor(public readonly id: string) {}

  static create(id: string) {
    return new GetCustomerFiscalProfileByIdQuery(id);
  }
}

@QueryHandler(GetCustomerFiscalProfileByIdQuery)
export class GetCustomerFiscalProfileByIdHandler
  extends BaseQueryHandler<
    GetCustomerFiscalProfileByIdQuery,
    CustomerFiscalProfileViewDto
  >
  implements IQueryHandler<GetCustomerFiscalProfileByIdQuery>
{
  constructor(private readonly useCase: GetCustomerFiscalProfileByIdUseCase) {
    super();
  }

  async execute(
    query: GetCustomerFiscalProfileByIdQuery,
  ): Promise<CustomerFiscalProfileViewDto> {
    return this.run(query, () => this.useCase.execute(query.id));
  }
}
