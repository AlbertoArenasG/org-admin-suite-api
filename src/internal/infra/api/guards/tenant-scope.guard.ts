import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';

import {
  AuthenticatedTenantContextDto,
  AuthenticatedUserContext,
  AuthenticatedUserContextDto,
} from '@application/dto';
import { TenantUserRole } from '@domain/entities';
import { AuthorizationException } from '@domain/exceptions';

const TENANT_HEADER = 'x-tenant-id';
const PRIVILEGED_TENANT_ROLES = new Set<TenantUserRole>([
  TenantUserRole.TENANT_OWNER,
  TenantUserRole.TENANT_ADMIN,
]);

@Injectable()
export class TenantScopeGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authContext = request.authContext as
      | AuthenticatedUserContextDto
      | undefined;

    if (!authContext) {
      throw AuthorizationException.authContextMissing();
    }

    const tenantIdFromHeader = this.extractTenantId(request);
    const effectiveTenantId =
      tenantIdFromHeader ?? authContext.defaultTenantId ?? null;

    if (!effectiveTenantId) {
      throw AuthorizationException.tenantIdentifierRequired();
    }

    const activeTenant = this.resolveActiveTenant(
      authContext,
      effectiveTenantId,
      Boolean(tenantIdFromHeader),
    );

    this.ensureTenantMatchesRequest(request, activeTenant.tenantId);

    request.activeTenant = activeTenant;

    return true;
  }

  private extractTenantId(request: Request): string | null {
    const headerValue = request.headers[TENANT_HEADER];

    if (!headerValue) {
      return null;
    }

    const value = Array.isArray(headerValue) ? headerValue[0] : headerValue;
    const tenantId = value?.toString().trim();

    return tenantId || null;
  }

  private resolveActiveTenant(
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

    const membership = AuthenticatedUserContext.findTenant(
      authContext,
      tenantId,
    );

    if (!membership) {
      const reason = tenantProvidedExplicitly
        ? 'access_denied'
        : 'default_tenant_not_accessible';
      throw AuthorizationException.tenantAccessForbidden({
        tenantId,
        reason,
      });
    }

    this.ensurePrivilegedRole(membership.role);

    return {
      tenantId: membership.tenantId,
      tenantUserId: membership.tenantUserId,
      role: membership.role,
    };
  }

  private ensureTenantMatchesRequest(request: Request, tenantId: string): void {
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

  private ensurePrivilegedRole(role: TenantUserRole): void {
    if (!PRIVILEGED_TENANT_ROLES.has(role)) {
      throw AuthorizationException.tenantPrivilegesInsufficient(role);
    }
  }
}
