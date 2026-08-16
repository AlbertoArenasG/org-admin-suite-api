import { InternalAssetMaintenanceRecord } from '@domain/entities';

export interface IInternalAssetMaintenanceRecordWriteRepository {
  create(
    record: InternalAssetMaintenanceRecord,
  ): Promise<{ data: InternalAssetMaintenanceRecord | null }>;
  update(
    record: InternalAssetMaintenanceRecord,
  ): Promise<{ data: InternalAssetMaintenanceRecord | null }>;
}

export const IInternalAssetMaintenanceRecordWriteRepositoryToken = Symbol(
  'IInternalAssetMaintenanceRecordWriteRepository',
);
