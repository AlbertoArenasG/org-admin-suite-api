import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetServicePackageRecordServiceTypeOptionsResultDto } from '@application/dto';
import { GetServicePackageRecordServiceTypeOptionsUseCase } from '@application/use-cases';
import { BaseQueryHandler } from '@infra/cqrs/base-query.handler';

export class GetServicePackageRecordServiceTypeOptionsQuery {
  static create() {
    return new GetServicePackageRecordServiceTypeOptionsQuery();
  }
}

@QueryHandler(GetServicePackageRecordServiceTypeOptionsQuery)
export class GetServicePackageRecordServiceTypeOptionsHandler
  extends BaseQueryHandler<
    GetServicePackageRecordServiceTypeOptionsQuery,
    GetServicePackageRecordServiceTypeOptionsResultDto
  >
  implements IQueryHandler<GetServicePackageRecordServiceTypeOptionsQuery>
{
  constructor(
    private readonly useCase: GetServicePackageRecordServiceTypeOptionsUseCase,
  ) {
    super();
  }

  async execute(
    query: GetServicePackageRecordServiceTypeOptionsQuery,
  ): Promise<GetServicePackageRecordServiceTypeOptionsResultDto> {
    return this.run(query, () => this.useCase.execute());
  }
}
