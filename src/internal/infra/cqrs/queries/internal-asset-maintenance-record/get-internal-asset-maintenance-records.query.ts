import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  GetInternalAssetMaintenanceRecordsDto,
  GetInternalAssetMaintenanceRecordsResultDto,
} from '@application/dto';
import { GetInternalAssetMaintenanceRecordsUseCase } from '@application/use-cases';
import { BaseQueryHandler } from '@infra/cqrs/base-query.handler';

export class GetInternalAssetMaintenanceRecordsQuery {
  private constructor(
    public readonly payload: GetInternalAssetMaintenanceRecordsDto,
  ) {}

  static create(payload: GetInternalAssetMaintenanceRecordsDto) {
    return new GetInternalAssetMaintenanceRecordsQuery(payload);
  }
}

@QueryHandler(GetInternalAssetMaintenanceRecordsQuery)
export class GetInternalAssetMaintenanceRecordsHandler
  extends BaseQueryHandler<
    GetInternalAssetMaintenanceRecordsQuery,
    GetInternalAssetMaintenanceRecordsResultDto
  >
  implements IQueryHandler<GetInternalAssetMaintenanceRecordsQuery>
{
  constructor(
    private readonly useCase: GetInternalAssetMaintenanceRecordsUseCase,
  ) {
    super();
  }

  async execute(
    query: GetInternalAssetMaintenanceRecordsQuery,
  ): Promise<GetInternalAssetMaintenanceRecordsResultDto> {
    return this.run(query, () => this.useCase.execute(query.payload));
  }
}
