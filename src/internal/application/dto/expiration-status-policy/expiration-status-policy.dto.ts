import {
  AuditUserDto,
  PaginatedResultDto,
  PaginationParamsDto,
} from '@application/dto/shared';
import { ExpirationStatusPolicyStatus } from '@domain/entities';
import {
  ExpirationStatusPolicySortDirection,
  ExpirationStatusPolicySortField,
} from '@domain/ports/repositories';

export interface ExpirationStatusPolicyOffsetDto {
  years: number;
  months: number;
  weeks: number;
  days: number;
}

export interface ExpirationStatusPolicyRuleDto {
  ruleId: string;
  startOffset: ExpirationStatusPolicyOffsetDto;
  label: string;
  colorHex: string;
}

export interface ExpirationStatusPolicyListItemDto {
  id: string;
  name: string;
  code: string;
  description: string | null;
  status: ExpirationStatusPolicyStatus;
  rulesCount: number;
  createdAt: Date;
  updatedAt?: Date;
}

export interface ExpirationStatusPolicyOptionDto {
  id: string;
  name: string;
  code: string;
  status: ExpirationStatusPolicyStatus;
}

export interface ExpirationStatusPolicyCatalogItemDto {
  code: string;
  name: string;
  nameKey: string;
}

export interface ExpirationStatusPolicyCatalogDto {
  statuses: ExpirationStatusPolicyCatalogItemDto[];
}

export interface ExpirationStatusPolicyViewDto {
  id: string;
  name: string;
  code: string;
  description: string | null;
  status: ExpirationStatusPolicyStatus;
  rules: ExpirationStatusPolicyRuleDto[];
  createdBy: AuditUserDto | null;
  updatedBy: AuditUserDto | null;
  createdAt: Date;
  updatedAt?: Date;
}

export interface GetExpirationStatusPoliciesDto extends PaginationParamsDto {
  search: string | null;
  status: ExpirationStatusPolicyStatus | null;
  sorts: Array<{
    field: ExpirationStatusPolicySortField;
    direction: ExpirationStatusPolicySortDirection;
  }>;
}

export interface GetExpirationStatusPolicyOptionsDto {
  search: string | null;
  status: ExpirationStatusPolicyStatus | null;
}

export interface CreateExpirationStatusPolicyDto {
  actorUserId: string;
  name: string;
  description: string | null;
  status: ExpirationStatusPolicyStatus;
  rules: Array<{
    ruleId?: string;
    startOffset: ExpirationStatusPolicyOffsetDto;
    label: string;
    colorHex: string;
  }>;
}

export interface UpdateExpirationStatusPolicyDto
  extends CreateExpirationStatusPolicyDto {
  expirationStatusPolicyId: string;
}

export interface DeleteExpirationStatusPolicyDto {
  actorUserId: string;
  expirationStatusPolicyId: string;
}

export type GetExpirationStatusPoliciesResultDto =
  PaginatedResultDto<ExpirationStatusPolicyListItemDto>;
export type GetExpirationStatusPolicyByIdResultDto =
  ExpirationStatusPolicyViewDto;
export type GetExpirationStatusPolicyOptionsResultDto =
  ExpirationStatusPolicyOptionDto[];
export type GetExpirationStatusPolicyCatalogResultDto =
  ExpirationStatusPolicyCatalogDto;
export type CreateExpirationStatusPolicyResultDto =
  ExpirationStatusPolicyViewDto;
export type UpdateExpirationStatusPolicyResultDto =
  ExpirationStatusPolicyViewDto;
