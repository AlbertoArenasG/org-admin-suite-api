import {
  AuditUserDto,
  PaginatedResultDto,
  PaginationParamsDto,
  RecipientGroupChannelDto,
} from '@application/dto';
import {
  ExpirationNotificationPolicyAnchor,
  ExpirationNotificationPolicyRepeatUntil,
  ExpirationNotificationPolicyStatus,
  ExpirationNotificationPolicyTriggerMode,
} from '@domain/entities';
import {
  ExpirationNotificationPolicySortDirection,
  ExpirationNotificationPolicySortField,
} from '@domain/ports/repositories';

export interface ExpirationNotificationPolicyOffsetDto {
  years: number;
  months: number;
  weeks: number;
  days: number;
}

export interface ExpirationNotificationPolicyRecipientGroupSummaryDto {
  id: string;
  name: string;
  code: string;
  status: string;
  enabledChannels: RecipientGroupChannelDto[];
}

export interface ExpirationNotificationPolicyRuleDto {
  ruleId: string;
  anchor: ExpirationNotificationPolicyAnchor;
  startOffset: ExpirationNotificationPolicyOffsetDto;
  triggerMode: ExpirationNotificationPolicyTriggerMode;
  recipientGroupIds: string[];
  repeatEvery: ExpirationNotificationPolicyOffsetDto | null;
  repeatUntil: ExpirationNotificationPolicyRepeatUntil | null;
  repeatFor: ExpirationNotificationPolicyOffsetDto | null;
  recipientGroups: ExpirationNotificationPolicyRecipientGroupSummaryDto[];
}

export interface ExpirationNotificationPolicyListItemDto {
  id: string;
  name: string;
  code: string;
  status: ExpirationNotificationPolicyStatus;
  rulesCount: number;
  createdAt: Date;
  updatedAt?: Date;
}

export interface ExpirationNotificationPolicyOptionDto {
  id: string;
  name: string;
  code: string;
  status: ExpirationNotificationPolicyStatus;
}

export interface ExpirationNotificationPolicyCatalogItemDto {
  code: string;
  name: string;
  nameKey: string;
}

export interface ExpirationNotificationPolicyCatalogDto {
  statuses: ExpirationNotificationPolicyCatalogItemDto[];
  anchors: ExpirationNotificationPolicyCatalogItemDto[];
  triggerModes: ExpirationNotificationPolicyCatalogItemDto[];
  repeatUntilValues: ExpirationNotificationPolicyCatalogItemDto[];
}

export interface ExpirationNotificationPolicyViewDto {
  id: string;
  name: string;
  code: string;
  description: string | null;
  status: ExpirationNotificationPolicyStatus;
  rules: ExpirationNotificationPolicyRuleDto[];
  createdBy: AuditUserDto | null;
  updatedBy: AuditUserDto | null;
  createdAt: Date;
  updatedAt?: Date;
}

export interface GetExpirationNotificationPoliciesDto
  extends PaginationParamsDto {
  search: string | null;
  status: ExpirationNotificationPolicyStatus | null;
  sorts: Array<{
    field: ExpirationNotificationPolicySortField;
    direction: ExpirationNotificationPolicySortDirection;
  }>;
}

export interface GetExpirationNotificationPolicyOptionsDto {
  search: string | null;
  status: ExpirationNotificationPolicyStatus | null;
}

export interface CreateExpirationNotificationPolicyDto {
  actorUserId: string;
  name: string;
  description: string | null;
  status: ExpirationNotificationPolicyStatus;
  rules: Array<{
    ruleId?: string;
    anchor: ExpirationNotificationPolicyAnchor;
    startOffset: ExpirationNotificationPolicyOffsetDto;
    triggerMode: ExpirationNotificationPolicyTriggerMode;
    recipientGroupIds: string[];
    repeatEvery?: ExpirationNotificationPolicyOffsetDto | null;
    repeatUntil?: ExpirationNotificationPolicyRepeatUntil | null;
    repeatFor?: ExpirationNotificationPolicyOffsetDto | null;
  }>;
}

export interface UpdateExpirationNotificationPolicyDto
  extends CreateExpirationNotificationPolicyDto {
  expirationNotificationPolicyId: string;
}

export interface DeleteExpirationNotificationPolicyDto {
  actorUserId: string;
  expirationNotificationPolicyId: string;
}

export type GetExpirationNotificationPoliciesResultDto =
  PaginatedResultDto<ExpirationNotificationPolicyListItemDto>;
export type GetExpirationNotificationPolicyByIdResultDto =
  ExpirationNotificationPolicyViewDto;
export type GetExpirationNotificationPolicyOptionsResultDto =
  ExpirationNotificationPolicyOptionDto[];
export type GetExpirationNotificationPolicyCatalogResultDto =
  ExpirationNotificationPolicyCatalogDto;
export type CreateExpirationNotificationPolicyResultDto =
  ExpirationNotificationPolicyViewDto;
export type UpdateExpirationNotificationPolicyResultDto =
  ExpirationNotificationPolicyViewDto;
