import { IsOptional, IsString } from 'class-validator';

import { RefreshInternalAssetMaintenanceRecordMaterializationsDto } from '@application/dto';

export class RefreshInternalAssetMaintenanceRecordMaterializationsRequestDto {
  @IsOptional()
  @IsString()
  cursor?: string;

  toDomain(): RefreshInternalAssetMaintenanceRecordMaterializationsDto {
    return { cursor: this.cursor ?? null };
  }
}
