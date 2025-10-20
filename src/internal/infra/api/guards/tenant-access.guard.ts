import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import {
  AuthenticatedActor,
  AuthenticatedActorDto,
  AuthenticatedTenantDto,
} from '@application/dto';
import { TenantUserRole } from '@domain/entities';

const PRIVILEGED_TENANT_ROLES = new Set<TenantUserRole>([
  TenantUserRole.TENANT_OWNER,
  TenantUserRole.TENANT_ADMIN,
]);

@Injectable()
export class TenantAccessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const actor = request.authActor as AuthenticatedActorDto | undefined;

    if (!actor || !AuthenticatedActor.isTenant(actor)) {
      throw new ForbiddenException('Tenant credentials required');
    }

    if (!PRIVILEGED_TENANT_ROLES.has(actor.role)) {
      throw new ForbiddenException('Insufficient tenant privileges');
    }

    this.ensureTenantMatchesContext(actor, request);

    return true;
  }

  private ensureTenantMatchesContext(
    actor: AuthenticatedTenantDto,
    request: any,
  ): void {
    const tenantIdFromParams =
      request.params?.tenantId ?? request.params?.tenant_id;
    const tenantIdFromBody = request.body?.tenant_id ?? request.body?.tenantId;

    const expectedTenantId = tenantIdFromParams ?? tenantIdFromBody;

    if (expectedTenantId && expectedTenantId !== actor.tenantId) {
      throw new ForbiddenException('Tenant mismatch');
    }
  }
}
