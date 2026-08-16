import {
  ExpirationStatusPolicy,
  ExpirationStatusPolicyStatus,
} from '@domain/entities';

export type ExpirationStatusPolicySortField = 'name' | 'status' | 'created_at';
export type ExpirationStatusPolicySortDirection = 'asc' | 'desc';

export interface FindExpirationStatusPoliciesParams {
  page: number;
  perPage: number;
  search?: string | null;
  status?: ExpirationStatusPolicyStatus | null;
  sorts: Array<{
    field: ExpirationStatusPolicySortField;
    direction: ExpirationStatusPolicySortDirection;
  }>;
}

export interface FindExpirationStatusPolicyOptionsParams {
  search?: string | null;
  status?: ExpirationStatusPolicyStatus | null;
}

export interface FindExpirationStatusPoliciesResult {
  data: ExpirationStatusPolicy[];
  total: number;
}

export interface IExpirationStatusPolicyReadRepository {
  findById(
    expirationStatusPolicyId: string,
  ): Promise<{ data: ExpirationStatusPolicy | null }>;
  findByName(name: string): Promise<{ data: ExpirationStatusPolicy | null }>;
  findByCode(code: string): Promise<{ data: ExpirationStatusPolicy | null }>;
  findAll(
    params: FindExpirationStatusPoliciesParams,
  ): Promise<FindExpirationStatusPoliciesResult>;
  findOptions(
    params: FindExpirationStatusPolicyOptionsParams,
  ): Promise<{ data: ExpirationStatusPolicy[] }>;
}

export const IExpirationStatusPolicyReadRepositoryToken = Symbol(
  'IExpirationStatusPolicyReadRepository',
);
