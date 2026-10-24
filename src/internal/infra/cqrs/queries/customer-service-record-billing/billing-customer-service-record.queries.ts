import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  GetBillingCustomerServiceRecordsDto,
  GetBillingCustomerServiceRecordsResultDto,
  GetBillingCustomerServiceRecordByIdResultDto,
} from '@application/dto/customer-service-record-billing';
import {
  GetBillingCustomerServiceRecordsUseCase,
  GetBillingCustomerServiceRecordByIdUseCase,
  GetBillingCustomerServiceRecordStatusOptionsUseCase,
} from '@application/use-cases/customer-service-record-billing';
import { BaseQueryHandler } from '@infra/cqrs/base-query.handler';

export class GetBillingCustomerServiceRecordsQuery {
  private constructor(
    public readonly payload: GetBillingCustomerServiceRecordsDto,
  ) {}
  static create(payload: GetBillingCustomerServiceRecordsDto) {
    return new GetBillingCustomerServiceRecordsQuery(payload);
  }
}

@QueryHandler(GetBillingCustomerServiceRecordsQuery)
export class GetBillingCustomerServiceRecordsHandler
  extends BaseQueryHandler<
    GetBillingCustomerServiceRecordsQuery,
    GetBillingCustomerServiceRecordsResultDto
  >
  implements IQueryHandler<GetBillingCustomerServiceRecordsQuery>
{
  constructor(
    private readonly useCase: GetBillingCustomerServiceRecordsUseCase,
  ) {
    super();
  }
  async execute(query: GetBillingCustomerServiceRecordsQuery) {
    return this.run(query, () => this.useCase.execute(query.payload));
  }
}

export class GetBillingCustomerServiceRecordByIdQuery {
  private constructor(public readonly recordId: string) {}
  static create(recordId: string) {
    return new GetBillingCustomerServiceRecordByIdQuery(recordId);
  }
}

@QueryHandler(GetBillingCustomerServiceRecordByIdQuery)
export class GetBillingCustomerServiceRecordByIdHandler
  extends BaseQueryHandler<
    GetBillingCustomerServiceRecordByIdQuery,
    GetBillingCustomerServiceRecordByIdResultDto
  >
  implements IQueryHandler<GetBillingCustomerServiceRecordByIdQuery>
{
  constructor(
    private readonly useCase: GetBillingCustomerServiceRecordByIdUseCase,
  ) {
    super();
  }
  async execute(query: GetBillingCustomerServiceRecordByIdQuery) {
    return this.run(query, () => this.useCase.execute(query.recordId));
  }
}

export class GetBillingCustomerServiceRecordStatusOptionsQuery {
  static create() {
    return new GetBillingCustomerServiceRecordStatusOptionsQuery();
  }
}

@QueryHandler(GetBillingCustomerServiceRecordStatusOptionsQuery)
export class GetBillingCustomerServiceRecordStatusOptionsHandler
  extends BaseQueryHandler<
    GetBillingCustomerServiceRecordStatusOptionsQuery,
    string[]
  >
  implements IQueryHandler<GetBillingCustomerServiceRecordStatusOptionsQuery>
{
  constructor(
    private readonly useCase: GetBillingCustomerServiceRecordStatusOptionsUseCase,
  ) {
    super();
  }
  async execute(query: GetBillingCustomerServiceRecordStatusOptionsQuery) {
    return this.run(query, () => this.useCase.execute());
  }
}
