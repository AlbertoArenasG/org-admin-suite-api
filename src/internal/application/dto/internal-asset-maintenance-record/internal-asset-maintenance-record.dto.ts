import {
  AuditUserDto,
  PaginatedResultDto,
  PaginationParamsDto,
} from '@application/dto';
import {
  InternalAssetMaintenanceRecordStatus,
  InternalAssetMaintenanceType,
} from '@domain/entities';

export interface InternalAssetMaintenanceIntervalDto {
  years: number;
  months: number;
  weeks: number;
  days: number;
}

export interface InternalAssetMaintenanceProviderDto {
  sentToProvider: boolean;
  providerName: string | null;
  sentToProviderAt: string | null;
  providerLeadTime: InternalAssetMaintenanceIntervalDto | null;
  providerNotes: string | null;
}

export interface InternalAssetMaintenanceRecipientGroupSummaryDto {
  id: string;
  name: string;
  code: string;
  status: string;
  enabledChannels: Array<{ code: string }>;
}

export interface InternalAssetMaintenanceProviderFollowUpRuleDto {
  offset: InternalAssetMaintenanceIntervalDto;
  recipientGroupIds: string[];
  ccRecipientGroupIds: string[];
  recipientGroups: InternalAssetMaintenanceRecipientGroupSummaryDto[];
  ccRecipientGroups: InternalAssetMaintenanceRecipientGroupSummaryDto[];
}

export interface InternalAssetMaintenanceProviderFollowUpDto {
  enabled: boolean;
  rules: InternalAssetMaintenanceProviderFollowUpRuleDto[];
  lastSentAt: Date | null;
}

export interface InternalAssetMaintenanceProviderFollowUpRuleInputDto {
  offset: InternalAssetMaintenanceIntervalDto;
  recipientGroupIds: string[];
  ccRecipientGroupIds: string[];
}

export interface InternalAssetMaintenanceProviderFollowUpInputDto {
  enabled: boolean;
  rules: InternalAssetMaintenanceProviderFollowUpRuleInputDto[];
  lastSentAt: Date | null;
}

export interface InternalAssetMaintenanceDerivedStatusDto {
  code: string;
  label: string;
  labelKey: string | null;
  colorHex: string;
  source: 'SYSTEM' | 'POLICY';
}

export interface InternalAssetMaintenanceCatalogItemDto {
  code: string;
  name: string;
  nameKey: string;
}

export interface InternalAssetMaintenanceRecordCatalogDto {
  assetMaintenanceTypes: InternalAssetMaintenanceCatalogItemDto[];
  statuses: InternalAssetMaintenanceCatalogItemDto[];
}

export interface InternalAssetMaintenancePolicySummaryDto {
  id: string;
  name: string;
  code: string;
  status: string;
}

export interface InternalAssetMaintenanceRecordListItemDto {
  id: string;
  assetName: string;
  assetIdentifier: string;
  assetMaintenanceType: InternalAssetMaintenanceType;
  lastMaintenanceAt: string;
  expirationDate: string;
  status: InternalAssetMaintenanceRecordStatus;
  derivedStatus: InternalAssetMaintenanceDerivedStatusDto;
  expirationStatusPolicy: InternalAssetMaintenancePolicySummaryDto | null;
  expirationNotificationPolicy: InternalAssetMaintenancePolicySummaryDto | null;
  sentToProvider: boolean;
  providerName: string | null;
  providerLeadTime: InternalAssetMaintenanceIntervalDto | null;
  providerFollowUpEnabled: boolean;
  providerFollowUpRulesCount: number;
  providerFollowUpLastSentAt: Date | null;
  createdAt: Date;
  updatedAt?: Date;
}

export interface InternalAssetMaintenanceRecordViewDto {
  id: string;
  assetName: string;
  assetIdentifier: string;
  assetMaintenanceType: InternalAssetMaintenanceType;
  lastMaintenanceAt: string;
  interval: InternalAssetMaintenanceIntervalDto;
  expirationDate: string;
  observations: string | null;
  status: InternalAssetMaintenanceRecordStatus;
  derivedStatus: InternalAssetMaintenanceDerivedStatusDto;
  expirationStatusPolicy: InternalAssetMaintenancePolicySummaryDto | null;
  expirationNotificationPolicy: InternalAssetMaintenancePolicySummaryDto | null;
  provider: InternalAssetMaintenanceProviderDto | null;
  providerFollowUp: InternalAssetMaintenanceProviderFollowUpDto | null;
  createdBy: AuditUserDto | null;
  updatedBy: AuditUserDto | null;
  createdAt: Date;
  updatedAt?: Date;
}

export interface GetInternalAssetMaintenanceRecordsDto
  extends PaginationParamsDto {
  search: string | null;
  assetMaintenanceType: InternalAssetMaintenanceType | null;
  status: InternalAssetMaintenanceRecordStatus | null;
  expirationStatusPolicyId: string | null;
  expirationNotificationPolicyId: string | null;
  sentToProvider: boolean | null;
  sorts: Array<{
    field:
      | 'asset_name'
      | 'asset_identifier'
      | 'last_maintenance_at'
      | 'expiration_date'
      | 'status'
      | 'created_at';
    direction: 'asc' | 'desc';
  }>;
}

export interface CreateInternalAssetMaintenanceRecordDto {
  actorUserId: string;
  assetName: string;
  assetIdentifier: string;
  assetMaintenanceType: InternalAssetMaintenanceType;
  lastMaintenanceAt: string;
  interval: InternalAssetMaintenanceIntervalDto;
  expirationDate: string | null;
  observations: string | null;
  status: InternalAssetMaintenanceRecordStatus;
  expirationStatusPolicyId: string | null;
  expirationNotificationPolicyId: string | null;
  provider: InternalAssetMaintenanceProviderDto | null;
  providerFollowUp: InternalAssetMaintenanceProviderFollowUpInputDto | null;
}

export interface UpdateInternalAssetMaintenanceRecordDto
  extends CreateInternalAssetMaintenanceRecordDto {
  recordId: string;
}

export interface DeleteInternalAssetMaintenanceRecordDto {
  actorUserId: string;
  recordId: string;
}

export interface SendInternalAssetMaintenanceProviderFollowUpDto {
  actorUserId: string;
  recordId: string;
}

export type GetInternalAssetMaintenanceRecordsResultDto =
  PaginatedResultDto<InternalAssetMaintenanceRecordListItemDto>;
export type GetInternalAssetMaintenanceRecordByIdResultDto =
  InternalAssetMaintenanceRecordViewDto;
export type GetInternalAssetMaintenanceRecordCatalogResultDto =
  InternalAssetMaintenanceRecordCatalogDto;
export type CreateInternalAssetMaintenanceRecordResultDto =
  InternalAssetMaintenanceRecordViewDto;
export type UpdateInternalAssetMaintenanceRecordResultDto =
  InternalAssetMaintenanceRecordViewDto;
export type SendInternalAssetMaintenanceProviderFollowUpResultDto =
  InternalAssetMaintenanceRecordViewDto;
