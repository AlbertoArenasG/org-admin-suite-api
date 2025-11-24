import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ServicePackageRecordViewDto } from '@application/dto';
import { GetServicePackageRecordByIdUseCase } from '@application/use-cases';
import { BaseQueryHandler } from '@infra/cqrs/base-query.handler';

export class GetServicePackageRecordByIdQuery {
  private constructor(public readonly recordId: string) {}

  static create(recordId: string) {
    return new GetServicePackageRecordByIdQuery(recordId);
  }
}

@QueryHandler(GetServicePackageRecordByIdQuery)
export class GetServicePackageRecordByIdHandler
  extends BaseQueryHandler<
    GetServicePackageRecordByIdQuery,
    ServicePackageRecordViewDto
  >
  implements IQueryHandler<GetServicePackageRecordByIdQuery>
{
  constructor(private readonly useCase: GetServicePackageRecordByIdUseCase) {
    super();
  }

  async execute(
    query: GetServicePackageRecordByIdQuery,
  ): Promise<ServicePackageRecordViewDto> {
    return this.run(query, () => this.useCase.execute(query.recordId));
  }
}
