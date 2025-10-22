import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';

import { AuthorizationException } from '@domain/exceptions';
import {
  ensureTenantMatchesRequestContext,
  extractTenantIdFromHeader,
  resolveActiveTenantContext,
} from './utils';
import { AuthenticatedUserContextDto } from '@application/dto';

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

    const activeTenant = resolveActiveTenantContext(
      authContext,
      effectiveTenantId,
      Boolean(tenantIdFromHeader),
    );

    ensureTenantMatchesRequestContext(request, activeTenant.tenantId);

    request.activeTenant = activeTenant;

    return true;
  }

  private extractTenantId(request: Request): string | null {
    return extractTenantIdFromHeader(request);
  }
}
