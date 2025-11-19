import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  GetCustomerFiscalProfilesDto,
  GetCustomerFiscalProfilesResultDto,
} from '@application/dto';
import { GetCustomerFiscalProfilesUseCase } from '@application/use-cases';
import { BaseQueryHandler } from '@infra/cqrs/base-query.handler';

export class GetCustomerFiscalProfilesQuery {
  private constructor(public readonly payload: GetCustomerFiscalProfilesDto) {}

  static create(payload: GetCustomerFiscalProfilesDto) {
    return new GetCustomerFiscalProfilesQuery(payload);
  }
}

@QueryHandler(GetCustomerFiscalProfilesQuery)
export class GetCustomerFiscalProfilesHandler
  extends BaseQueryHandler<
    GetCustomerFiscalProfilesQuery,
    GetCustomerFiscalProfilesResultDto
  >
  implements IQueryHandler<GetCustomerFiscalProfilesQuery>
{
  constructor(private readonly useCase: GetCustomerFiscalProfilesUseCase) {
    super();
  }

  async execute(
    query: GetCustomerFiscalProfilesQuery,
  ): Promise<GetCustomerFiscalProfilesResultDto> {
    return this.run(query, () => this.useCase.execute(query.payload));
  }
}
