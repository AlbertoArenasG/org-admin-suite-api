import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { BillingRecordArchive } from '@domain/entities';
import { BillingRecordComment } from '@domain/entities';
import {
  GetBillingCustomerServiceRecordArchiveByIdUseCase,
  GetBillingCustomerServiceRecordArchivesUseCase,
  GetBillingCustomerServiceRecordCommentsUseCase,
} from '@application/use-cases/customer-service-record-billing';
import { BaseQueryHandler } from '@infra/cqrs/base-query.handler';

export class GetBillingCustomerServiceRecordArchivesQuery {
  private constructor(
    public readonly recordId: string,
    public readonly page: number,
    public readonly perPage: number,
  ) {}
  static create(recordId: string, page: number, perPage: number) {
    return new GetBillingCustomerServiceRecordArchivesQuery(
      recordId,
      page,
      perPage,
    );
  }
}

export class GetBillingCustomerServiceRecordCommentsQuery {
  private constructor(
    public readonly recordId: string,
    public readonly page: number,
    public readonly perPage: number,
  ) {}
  static create(recordId: string, page: number, perPage: number) {
    return new GetBillingCustomerServiceRecordCommentsQuery(
      recordId,
      page,
      perPage,
    );
  }
}
@QueryHandler(GetBillingCustomerServiceRecordCommentsQuery)
export class GetBillingCustomerServiceRecordCommentsHandler
  extends BaseQueryHandler<
    GetBillingCustomerServiceRecordCommentsQuery,
    { data: BillingRecordComment[]; total: number }
  >
  implements IQueryHandler<GetBillingCustomerServiceRecordCommentsQuery>
{
  constructor(
    private readonly useCase: GetBillingCustomerServiceRecordCommentsUseCase,
  ) {
    super();
  }
  execute(query: GetBillingCustomerServiceRecordCommentsQuery) {
    return this.run(query, () =>
      this.useCase.execute(query.recordId, query.page, query.perPage),
    );
  }
}
@QueryHandler(GetBillingCustomerServiceRecordArchivesQuery)
export class GetBillingCustomerServiceRecordArchivesHandler
  extends BaseQueryHandler<
    GetBillingCustomerServiceRecordArchivesQuery,
    { data: BillingRecordArchive[]; total: number }
  >
  implements IQueryHandler<GetBillingCustomerServiceRecordArchivesQuery>
{
  constructor(
    private readonly useCase: GetBillingCustomerServiceRecordArchivesUseCase,
  ) {
    super();
  }
  execute(query: GetBillingCustomerServiceRecordArchivesQuery) {
    return this.run(query, () =>
      this.useCase.execute(query.recordId, query.page, query.perPage),
    );
  }
}

export class GetBillingCustomerServiceRecordArchiveByIdQuery {
  private constructor(
    public readonly recordId: string,
    public readonly archiveId: string,
  ) {}
  static create(recordId: string, archiveId: string) {
    return new GetBillingCustomerServiceRecordArchiveByIdQuery(
      recordId,
      archiveId,
    );
  }
}
@QueryHandler(GetBillingCustomerServiceRecordArchiveByIdQuery)
export class GetBillingCustomerServiceRecordArchiveByIdHandler
  extends BaseQueryHandler<
    GetBillingCustomerServiceRecordArchiveByIdQuery,
    BillingRecordArchive
  >
  implements IQueryHandler<GetBillingCustomerServiceRecordArchiveByIdQuery>
{
  constructor(
    private readonly useCase: GetBillingCustomerServiceRecordArchiveByIdUseCase,
  ) {
    super();
  }
  execute(query: GetBillingCustomerServiceRecordArchiveByIdQuery) {
    return this.run(query, () =>
      this.useCase.execute(query.recordId, query.archiveId),
    );
  }
}
