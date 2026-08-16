import { Injectable } from '@nestjs/common';

import { GetInternalAssetMaintenanceRecordCatalogResultDto } from '@application/dto';
import { InternalAssetMaintenanceRecordMapper } from '@application/mappers';

@Injectable()
export class GetInternalAssetMaintenanceRecordCatalogUseCase {
  async execute(): Promise<GetInternalAssetMaintenanceRecordCatalogResultDto> {
    return InternalAssetMaintenanceRecordMapper.toCatalogDto();
  }
}
