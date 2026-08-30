import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  GetCustomerServiceRecordByIdResultDto,
  GetCustomerServiceRecordsDto,
  GetCustomerServiceRecordsResultDto,
} from '@application/dto';
import {
  GetCustomerServiceRecordByIdUseCase,
  GetCustomerServiceRecordsUseCase,
} from '@application/use-cases';
import { BaseQueryHandler } from '@infra/cqrs/base-query.handler';
export class GetCustomerServiceRecordsQuery {
  private constructor(public readonly payload: GetCustomerServiceRecordsDto) {}
  static create(payload: GetCustomerServiceRecordsDto) {
    return new GetCustomerServiceRecordsQuery(payload);
  }
}
@QueryHandler(GetCustomerServiceRecordsQuery)
export class GetCustomerServiceRecordsHandler
  extends BaseQueryHandler<
    GetCustomerServiceRecordsQuery,
    GetCustomerServiceRecordsResultDto
  >
  implements IQueryHandler<GetCustomerServiceRecordsQuery>
{
  constructor(private readonly useCase: GetCustomerServiceRecordsUseCase) {
    super();
  }
  async execute(query: GetCustomerServiceRecordsQuery) {
    return this.run(query, () => this.useCase.execute(query.payload));
  }
}
export class GetCustomerServiceRecordByIdQuery {
  private constructor(public readonly recordId: string) {}
  static create(recordId: string) {
    return new GetCustomerServiceRecordByIdQuery(recordId);
  }
}
@QueryHandler(GetCustomerServiceRecordByIdQuery)
export class GetCustomerServiceRecordByIdHandler
  extends BaseQueryHandler<
    GetCustomerServiceRecordByIdQuery,
    GetCustomerServiceRecordByIdResultDto
  >
  implements IQueryHandler<GetCustomerServiceRecordByIdQuery>
{
  constructor(private readonly useCase: GetCustomerServiceRecordByIdUseCase) {
    super();
  }
  async execute(query: GetCustomerServiceRecordByIdQuery) {
    return this.run(query, () => this.useCase.execute(query.recordId));
  }
}
