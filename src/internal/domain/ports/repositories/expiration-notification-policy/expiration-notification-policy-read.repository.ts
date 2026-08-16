import {
  ExpirationNotificationPolicy,
  ExpirationNotificationPolicyStatus,
} from '@domain/entities';

export type ExpirationNotificationPolicySortField =
  | 'name'
  | 'status'
  | 'created_at';
export type ExpirationNotificationPolicySortDirection = 'asc' | 'desc';

export interface FindExpirationNotificationPoliciesParams {
  page: number;
  perPage: number;
  search?: string | null;
  status?: ExpirationNotificationPolicyStatus | null;
  sorts: Array<{
    field: ExpirationNotificationPolicySortField;
    direction: ExpirationNotificationPolicySortDirection;
  }>;
}

export interface FindExpirationNotificationPolicyOptionsParams {
  search?: string | null;
  status?: ExpirationNotificationPolicyStatus | null;
}

export interface FindExpirationNotificationPoliciesResult {
  data: ExpirationNotificationPolicy[];
  total: number;
}

export interface IExpirationNotificationPolicyReadRepository {
  findById(
    expirationNotificationPolicyId: string,
  ): Promise<{ data: ExpirationNotificationPolicy | null }>;
  findByName(name: string): Promise<{
    data: ExpirationNotificationPolicy | null;
  }>;
  findByCode(code: string): Promise<{
    data: ExpirationNotificationPolicy | null;
  }>;
  findAll(
    params: FindExpirationNotificationPoliciesParams,
  ): Promise<FindExpirationNotificationPoliciesResult>;
  findOptions(
    params: FindExpirationNotificationPolicyOptionsParams,
  ): Promise<{ data: ExpirationNotificationPolicy[] }>;
}

export const IExpirationNotificationPolicyReadRepositoryToken = Symbol(
  'IExpirationNotificationPolicyReadRepository',
);
