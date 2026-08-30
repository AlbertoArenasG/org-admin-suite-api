import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetCustomerServiceRecordServiceTypeOptionsResultDto } from '@application/dto';
import { GetCustomerServiceRecordServiceTypeOptionsUseCase } from '@application/use-cases';
import { BaseQueryHandler } from '@infra/cqrs/base-query.handler';

export class GetCustomerServiceRecordServiceTypeOptionsQuery {
  static create() {
    return new GetCustomerServiceRecordServiceTypeOptionsQuery();
  }
}

@QueryHandler(GetCustomerServiceRecordServiceTypeOptionsQuery)
export class GetCustomerServiceRecordServiceTypeOptionsHandler
  extends BaseQueryHandler<
    GetCustomerServiceRecordServiceTypeOptionsQuery,
    GetCustomerServiceRecordServiceTypeOptionsResultDto
  >
  implements IQueryHandler<GetCustomerServiceRecordServiceTypeOptionsQuery>
{
  constructor(
    private readonly useCase: GetCustomerServiceRecordServiceTypeOptionsUseCase,
  ) {
    super();
  }

  async execute(query: GetCustomerServiceRecordServiceTypeOptionsQuery) {
    return this.run(query, () => this.useCase.execute());
  }
}
