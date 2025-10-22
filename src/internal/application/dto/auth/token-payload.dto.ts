import { TenantUserRole, UserRole } from '@domain/entities';

export interface AuthTokenTenantClaimDto {
  tenantId: string;
  tenantUserId: string;
  role: TenantUserRole;
}

export interface AuthTokenPayloadDto {
  sub: string;
  role: UserRole;
  isMaster: boolean;
  tenants: AuthTokenTenantClaimDto[];
  defaultTenantId?: string | null;
  iat?: number;
  exp?: number;
}

export function isAuthTokenPayloadDto(
  payload: unknown,
): payload is AuthTokenPayloadDto {
  if (!payload || typeof payload !== 'object' || payload === null) return false;

  const candidate = payload as Record<string, unknown>;
  const tenants = candidate.tenants;

  return (
    typeof candidate.sub === 'string' &&
    typeof candidate.role === 'string' &&
    typeof candidate.isMaster === 'boolean' &&
    Array.isArray(tenants) &&
    tenants.every((tenant) => isAuthTokenTenantClaimDto(tenant)) &&
    (candidate.defaultTenantId === undefined ||
      candidate.defaultTenantId === null ||
      typeof candidate.defaultTenantId === 'string')
  );
}

function isAuthTokenTenantClaimDto(
  payload: unknown,
): payload is AuthTokenTenantClaimDto {
  if (!payload || typeof payload !== 'object' || payload === null) return false;

  const candidate = payload as Record<string, unknown>;

  return (
    typeof candidate.tenantId === 'string' &&
    typeof candidate.tenantUserId === 'string' &&
    typeof candidate.role === 'string'
  );
}
