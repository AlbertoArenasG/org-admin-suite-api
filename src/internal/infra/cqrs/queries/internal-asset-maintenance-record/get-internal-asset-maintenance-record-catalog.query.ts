import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetInternalAssetMaintenanceRecordCatalogResultDto } from '@application/dto';
import { GetInternalAssetMaintenanceRecordCatalogUseCase } from '@application/use-cases';
import { BaseQueryHandler } from '@infra/cqrs/base-query.handler';

export class GetInternalAssetMaintenanceRecordCatalogQuery {
  static create() {
    return new GetInternalAssetMaintenanceRecordCatalogQuery();
  }
}

@QueryHandler(GetInternalAssetMaintenanceRecordCatalogQuery)
export class GetInternalAssetMaintenanceRecordCatalogHandler
  extends BaseQueryHandler<
    GetInternalAssetMaintenanceRecordCatalogQuery,
    GetInternalAssetMaintenanceRecordCatalogResultDto
  >
  implements IQueryHandler<GetInternalAssetMaintenanceRecordCatalogQuery>
{
  constructor(
    private readonly useCase: GetInternalAssetMaintenanceRecordCatalogUseCase,
  ) {
    super();
  }

  async execute(): Promise<GetInternalAssetMaintenanceRecordCatalogResultDto> {
    return this.run(
      GetInternalAssetMaintenanceRecordCatalogQuery.create(),
      () => this.useCase.execute(),
    );
  }
}
