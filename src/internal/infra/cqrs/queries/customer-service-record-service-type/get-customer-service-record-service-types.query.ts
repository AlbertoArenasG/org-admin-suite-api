import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  GetCustomerServiceRecordServiceTypesDto,
  GetCustomerServiceRecordServiceTypesResultDto,
} from '@application/dto';
import { GetCustomerServiceRecordServiceTypesUseCase } from '@application/use-cases';
import { BaseQueryHandler } from '@infra/cqrs/base-query.handler';

export class GetCustomerServiceRecordServiceTypesQuery {
  private constructor(
    public readonly payload: GetCustomerServiceRecordServiceTypesDto,
  ) {}

  static create(payload: GetCustomerServiceRecordServiceTypesDto) {
    return new GetCustomerServiceRecordServiceTypesQuery(payload);
  }
}

@QueryHandler(GetCustomerServiceRecordServiceTypesQuery)
export class GetCustomerServiceRecordServiceTypesHandler
  extends BaseQueryHandler<
    GetCustomerServiceRecordServiceTypesQuery,
    GetCustomerServiceRecordServiceTypesResultDto
  >
  implements IQueryHandler<GetCustomerServiceRecordServiceTypesQuery>
{
  constructor(
    private readonly useCase: GetCustomerServiceRecordServiceTypesUseCase,
  ) {
    super();
  }

  async execute(query: GetCustomerServiceRecordServiceTypesQuery) {
    return this.run(query, () => this.useCase.execute(query.payload));
  }
}
