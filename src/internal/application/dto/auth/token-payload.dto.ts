import { TenantUserRole, UserRole } from '@domain/entities';

export interface MasterTokenPayloadDto {
  sub: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface TenantAccessTokenPayloadDto {
  sub: string;
  tenant_id: string;
  tenant_user_id: string;
  role: TenantUserRole;
  iat?: number;
  exp?: number;
}

export function isMasterTokenPayloadDto(
  payload: unknown,
): payload is MasterTokenPayloadDto {
  if (!payload || typeof payload !== 'object') return false;

  const candidate = payload as Record<string, unknown>;

  return (
    typeof candidate.sub === 'string' &&
    typeof candidate.role === 'string' &&
    !('tenant_id' in candidate)
  );
}

export function isTenantAccessTokenPayloadDto(
  payload: unknown,
): payload is TenantAccessTokenPayloadDto {
  if (!payload || typeof payload !== 'object') return false;

  const candidate = payload as Record<string, unknown>;

  return (
    typeof candidate.sub === 'string' &&
    typeof candidate.role === 'string' &&
    typeof candidate.tenant_id === 'string' &&
    typeof candidate.tenant_user_id === 'string'
  );
}
