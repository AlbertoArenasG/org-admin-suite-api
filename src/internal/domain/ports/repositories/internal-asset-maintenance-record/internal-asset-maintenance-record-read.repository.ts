import {
  ExpirationNotificationPolicy,
  ExpirationStatusPolicy,
  InternalAssetMaintenanceRecord,
  InternalAssetMaintenanceRecordStatus,
  InternalAssetMaintenanceType,
} from '@domain/entities';

export type InternalAssetMaintenanceRecordSortField =
  | 'asset_name'
  | 'asset_identifier'
  | 'last_maintenance_at'
  | 'expiration_date'
  | 'status'
  | 'created_at';
export type InternalAssetMaintenanceRecordSortDirection = 'asc' | 'desc';

export interface FindInternalAssetMaintenanceRecordsParams {
  page: number;
  perPage: number;
  search?: string | null;
  assetMaintenanceType?: InternalAssetMaintenanceType | null;
  status?: InternalAssetMaintenanceRecordStatus | null;
  expirationStatusPolicyId?: string | null;
  expirationNotificationPolicyId?: string | null;
  sentToProvider?: boolean | null;
  sorts: Array<{
    field: InternalAssetMaintenanceRecordSortField;
    direction: InternalAssetMaintenanceRecordSortDirection;
  }>;
}

export interface FindInternalAssetMaintenanceRecordsResult {
  data: InternalAssetMaintenanceRecord[];
  total: number;
}

export interface InternalAssetMaintenanceOperationalCursor {
  createdAt: Date;
  recordId: string;
}

export interface FindOperationalInternalAssetMaintenanceRecordsParams {
  after?: InternalAssetMaintenanceOperationalCursor;
  limit: number;
  expirationStatusPolicyId?: string | null;
  expirationNotificationPolicyId?: string | null;
}

export interface InternalAssetMaintenancePoliciesByIdResult {
  expirationStatusPoliciesById: Map<string, ExpirationStatusPolicy>;
  expirationNotificationPoliciesById: Map<string, ExpirationNotificationPolicy>;
}

export interface IInternalAssetMaintenanceRecordReadRepository {
  findById(
    recordId: string,
  ): Promise<{ data: InternalAssetMaintenanceRecord | null }>;
  findByExpirationStatusPolicyId(
    expirationStatusPolicyId: string,
  ): Promise<{ data: InternalAssetMaintenanceRecord[] }>;
  findByExpirationNotificationPolicyId(
    expirationNotificationPolicyId: string,
  ): Promise<{ data: InternalAssetMaintenanceRecord[] }>;
  findOperational(
    params: FindOperationalInternalAssetMaintenanceRecordsParams,
  ): Promise<{ data: InternalAssetMaintenanceRecord[] }>;
  findAll(
    params: FindInternalAssetMaintenanceRecordsParams,
  ): Promise<FindInternalAssetMaintenanceRecordsResult>;
  findPoliciesByIds(input: {
    expirationStatusPolicyIds: string[];
    expirationNotificationPolicyIds: string[];
  }): Promise<InternalAssetMaintenancePoliciesByIdResult>;
}

export const IInternalAssetMaintenanceRecordReadRepositoryToken = Symbol(
  'IInternalAssetMaintenanceRecordReadRepository',
);
