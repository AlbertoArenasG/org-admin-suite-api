import {
  InternalAssetExpirationNotificationMaterializationProps,
  InternalAssetExpirationStatusMaterializationProps,
  InternalAssetMaintenanceRecord,
} from '@domain/entities';

export interface UpdateInternalAssetMaintenanceRecordSystemManagedFieldsParams {
  recordId: string;
  expirationStatusPolicyId?: string | null;
  expirationNotificationPolicyId?: string | null;
  expirationStatusMaterialization?: InternalAssetExpirationStatusMaterializationProps | null;
  expirationNotificationMaterialization?: InternalAssetExpirationNotificationMaterializationProps | null;
}

export interface IInternalAssetMaintenanceRecordWriteRepository {
  create(
    record: InternalAssetMaintenanceRecord,
  ): Promise<{ data: InternalAssetMaintenanceRecord | null }>;
  update(
    record: InternalAssetMaintenanceRecord,
  ): Promise<{ data: InternalAssetMaintenanceRecord | null }>;
  updateSystemManagedFields(
    params: UpdateInternalAssetMaintenanceRecordSystemManagedFieldsParams,
  ): Promise<{ updated: boolean }>;
}

export const IInternalAssetMaintenanceRecordWriteRepositoryToken = Symbol(
  'IInternalAssetMaintenanceRecordWriteRepository',
);
