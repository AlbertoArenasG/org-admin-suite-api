import { Request } from 'express';

import {
  AuthTokenTenantClaimDto,
  AuthenticatedTenantContextDto,
  AuthenticatedUserContext,
  AuthenticatedUserContextDto,
} from '@application/dto';
import { TenantUserRole } from '@domain/entities';
import {
  AuthenticationException,
  AuthorizationException,
} from '@domain/exceptions';

export const TENANT_HEADER = 'x-tenant-id';

export const PRIVILEGED_TENANT_ROLES = new Set<TenantUserRole>([
  TenantUserRole.TENANT_OWNER,
  TenantUserRole.TENANT_ADMIN,
]);

export function extractBearerToken(request: Request): string {
  const authHeader = request.headers['authorization'];

  if (!authHeader) {
    throw AuthenticationException.tokenMissing();
  }

  if (Array.isArray(authHeader)) {
    throw AuthenticationException.authorizationHeaderInvalid({
      reason: 'multiple_values',
    });
  }

  const parts = authHeader.trim().split(/\s+/);

  if (parts.length !== 2) {
    throw AuthenticationException.authorizationHeaderInvalid({
      reason: 'unexpected_format',
    });
  }

  const [scheme, token] = parts;

  if (!scheme || scheme.toLowerCase() !== 'bearer') {
    throw AuthenticationException.authorizationHeaderInvalid({
      expectedScheme: 'Bearer',
      actualScheme: scheme,
    });
  }

  if (!token) {
    throw AuthenticationException.tokenMissing();
  }

  return token;
}

export function ensureValidTenantClaims(
  tenants: AuthTokenTenantClaimDto[],
  isMaster: boolean,
): void {
  if (isMaster) {
    return;
  }

  const hasInvalidTenant = tenants.some(
    (tenant) =>
      !tenant.tenantId ||
      !tenant.tenantUserId ||
      !tenant.role ||
      typeof tenant.tenantId !== 'string' ||
      typeof tenant.tenantUserId !== 'string' ||
      typeof tenant.role !== 'string',
  );

  if (hasInvalidTenant) {
    throw AuthenticationException.tokenPayloadInvalid({
      reason: 'invalid_tenant_claim',
    });
  }
}

export function ensureValidDefaultTenant(
  tenants: AuthTokenTenantClaimDto[],
  defaultTenantId: string | null | undefined,
  isMaster: boolean,
): void {
  if (!defaultTenantId || isMaster) return;

  const matchesTenant = tenants.some(
    (tenant) => tenant.tenantId === defaultTenantId,
  );

  if (!matchesTenant) {
    throw AuthenticationException.tokenPayloadInvalid({
      reason: 'default_tenant_not_found',
    });
  }
}

export function extractTenantIdFromHeader(request: Request): string | null {
  const headerValue = request.headers[TENANT_HEADER];

  if (!headerValue) {
    return null;
  }

  const value = Array.isArray(headerValue) ? headerValue[0] : headerValue;
  const tenantId = value?.toString().trim();

  return tenantId || null;
}

export function resolveActiveTenantContext(
  authContext: AuthenticatedUserContextDto,
  tenantId: string,
  tenantProvidedExplicitly: boolean,
): AuthenticatedTenantContextDto {
  if (authContext.isMaster) {
    return {
      tenantId,
      tenantUserId: null,
      role: null,
    };
  }

  const membership = AuthenticatedUserContext.findTenant(authContext, tenantId);

  if (!membership) {
    const reason = tenantProvidedExplicitly
      ? 'access_denied'
      : 'default_tenant_not_accessible';
    throw AuthorizationException.tenantAccessForbidden({
      tenantId,
      reason,
    });
  }

  ensurePrivilegedTenantRole(membership.role);

  return {
    tenantId: membership.tenantId,
    tenantUserId: membership.tenantUserId,
    role: membership.role,
  };
}

export function ensureTenantMatchesRequestContext(
  request: Request,
  tenantId: string,
): void {
  const tenantIdFromParams =
    (request.params?.tenantId as string | undefined) ??
    (request.params?.tenant_id as string | undefined);
  const tenantIdFromBody =
    (request.body?.tenantId as string | undefined) ??
    (request.body?.tenant_id as string | undefined);

  const expectedTenantId = tenantIdFromParams ?? tenantIdFromBody;

  if (expectedTenantId && expectedTenantId !== tenantId) {
    throw AuthorizationException.tenantMismatch(expectedTenantId, tenantId);
  }
}

export function ensurePrivilegedTenantRole(role: TenantUserRole): void {
  if (!PRIVILEGED_TENANT_ROLES.has(role)) {
    throw AuthorizationException.tenantPrivilegesInsufficient(role);
  }
}

export function isTokenExpiredError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    (error as { name: string }).name === 'TokenExpiredError'
  );
}

export function getJwtErrorName(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'name' in error) {
    return String((error as { name?: string }).name);
  }

  return 'Unknown';
}
