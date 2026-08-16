import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetInternalAssetMaintenanceRecordByIdResultDto } from '@application/dto';
import { GetInternalAssetMaintenanceRecordByIdUseCase } from '@application/use-cases';
import { BaseQueryHandler } from '@infra/cqrs/base-query.handler';

export class GetInternalAssetMaintenanceRecordByIdQuery {
  private constructor(public readonly recordId: string) {}

  static create(recordId: string) {
    return new GetInternalAssetMaintenanceRecordByIdQuery(recordId);
  }
}

@QueryHandler(GetInternalAssetMaintenanceRecordByIdQuery)
export class GetInternalAssetMaintenanceRecordByIdHandler
  extends BaseQueryHandler<
    GetInternalAssetMaintenanceRecordByIdQuery,
    GetInternalAssetMaintenanceRecordByIdResultDto
  >
  implements IQueryHandler<GetInternalAssetMaintenanceRecordByIdQuery>
{
  constructor(
    private readonly useCase: GetInternalAssetMaintenanceRecordByIdUseCase,
  ) {
    super();
  }

  async execute(
    query: GetInternalAssetMaintenanceRecordByIdQuery,
  ): Promise<GetInternalAssetMaintenanceRecordByIdResultDto> {
    return this.run(query, () => this.useCase.execute(query.recordId));
  }
}
