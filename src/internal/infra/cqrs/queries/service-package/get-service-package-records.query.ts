import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  GetServicePackageRecordsDto,
  GetServicePackageRecordsResultDto,
} from '@application/dto';
import { GetServicePackageRecordsUseCase } from '@application/use-cases';
import { BaseQueryHandler } from '@infra/cqrs/base-query.handler';

export class GetServicePackageRecordsQuery {
  private constructor(public readonly payload: GetServicePackageRecordsDto) {}

  static create(payload: GetServicePackageRecordsDto) {
    return new GetServicePackageRecordsQuery(payload);
  }
}

@QueryHandler(GetServicePackageRecordsQuery)
export class GetServicePackageRecordsHandler
  extends BaseQueryHandler<
    GetServicePackageRecordsQuery,
    GetServicePackageRecordsResultDto
  >
  implements IQueryHandler<GetServicePackageRecordsQuery>
{
  constructor(private readonly useCase: GetServicePackageRecordsUseCase) {
    super();
  }

  async execute(
    query: GetServicePackageRecordsQuery,
  ): Promise<GetServicePackageRecordsResultDto> {
    return this.run(query, () => this.useCase.execute(query.payload));
  }
}
