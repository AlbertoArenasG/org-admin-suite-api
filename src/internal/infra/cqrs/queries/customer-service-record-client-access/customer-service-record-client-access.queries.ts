import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  GetCustomerServiceRecordClientAccessListDto,
  GetCustomerServiceRecordClientAccessOptionsDto,
  GetCustomerServiceRecordClientAccessListResultDto,
  CustomerServiceRecordClientAccessViewDto,
  CustomerServiceRecordClientAccessCustomerOptionDto,
  CustomerServiceRecordClientAccessServiceTypeOptionDto,
} from '@application/dto';
import {
  GetCustomerServiceRecordClientAccessByIdUseCase,
  GetCustomerServiceRecordClientAccessCustomerOptionsUseCase,
  GetCustomerServiceRecordClientAccessListUseCase,
  GetCustomerServiceRecordClientAccessServiceTypeOptionsUseCase,
} from '@application/use-cases';
import { BaseQueryHandler } from '@infra/cqrs/base-query.handler';
export class GetCustomerServiceRecordClientAccessListQuery {
  private constructor(
    readonly payload: GetCustomerServiceRecordClientAccessListDto,
  ) {}
  static create(payload: GetCustomerServiceRecordClientAccessListDto) {
    return new this(payload);
  }
}
export class GetCustomerServiceRecordClientAccessByIdQuery {
  private constructor(
    readonly actorUserId: string,
    readonly recordId: string,
  ) {}
  static create(actorUserId: string, recordId: string) {
    return new this(actorUserId, recordId);
  }
}
export class GetCustomerServiceRecordClientAccessCustomerOptionsQuery {
  private constructor(
    readonly payload: GetCustomerServiceRecordClientAccessOptionsDto,
  ) {}
  static create(payload: GetCustomerServiceRecordClientAccessOptionsDto) {
    return new this(payload);
  }
}
export class GetCustomerServiceRecordClientAccessServiceTypeOptionsQuery {
  private constructor(
    readonly payload: GetCustomerServiceRecordClientAccessOptionsDto,
  ) {}
  static create(payload: GetCustomerServiceRecordClientAccessOptionsDto) {
    return new this(payload);
  }
}
@QueryHandler(GetCustomerServiceRecordClientAccessListQuery)
export class GetCustomerServiceRecordClientAccessListHandler
  extends BaseQueryHandler<
    GetCustomerServiceRecordClientAccessListQuery,
    GetCustomerServiceRecordClientAccessListResultDto
  >
  implements IQueryHandler<GetCustomerServiceRecordClientAccessListQuery>
{
  constructor(
    private readonly useCase: GetCustomerServiceRecordClientAccessListUseCase,
  ) {
    super();
  }
  execute(query: GetCustomerServiceRecordClientAccessListQuery) {
    return this.run(query, () => this.useCase.execute(query.payload));
  }
}
@QueryHandler(GetCustomerServiceRecordClientAccessByIdQuery)
export class GetCustomerServiceRecordClientAccessByIdHandler
  extends BaseQueryHandler<
    GetCustomerServiceRecordClientAccessByIdQuery,
    CustomerServiceRecordClientAccessViewDto
  >
  implements IQueryHandler<GetCustomerServiceRecordClientAccessByIdQuery>
{
  constructor(
    private readonly useCase: GetCustomerServiceRecordClientAccessByIdUseCase,
  ) {
    super();
  }
  execute(query: GetCustomerServiceRecordClientAccessByIdQuery) {
    return this.run(query, () =>
      this.useCase.execute(query.actorUserId, query.recordId),
    );
  }
}
@QueryHandler(GetCustomerServiceRecordClientAccessCustomerOptionsQuery)
export class GetCustomerServiceRecordClientAccessCustomerOptionsHandler
  extends BaseQueryHandler<
    GetCustomerServiceRecordClientAccessCustomerOptionsQuery,
    CustomerServiceRecordClientAccessCustomerOptionDto[]
  >
  implements
    IQueryHandler<GetCustomerServiceRecordClientAccessCustomerOptionsQuery>
{
  constructor(
    private readonly useCase: GetCustomerServiceRecordClientAccessCustomerOptionsUseCase,
  ) {
    super();
  }
  execute(query: GetCustomerServiceRecordClientAccessCustomerOptionsQuery) {
    return this.run(query, () => this.useCase.execute(query.payload));
  }
}
@QueryHandler(GetCustomerServiceRecordClientAccessServiceTypeOptionsQuery)
export class GetCustomerServiceRecordClientAccessServiceTypeOptionsHandler
  extends BaseQueryHandler<
    GetCustomerServiceRecordClientAccessServiceTypeOptionsQuery,
    CustomerServiceRecordClientAccessServiceTypeOptionDto[]
  >
  implements
    IQueryHandler<GetCustomerServiceRecordClientAccessServiceTypeOptionsQuery>
{
  constructor(
    private readonly useCase: GetCustomerServiceRecordClientAccessServiceTypeOptionsUseCase,
  ) {
    super();
  }
  execute(query: GetCustomerServiceRecordClientAccessServiceTypeOptionsQuery) {
    return this.run(query, () => this.useCase.execute(query.payload));
  }
}
