import { TenantUserRole, UserRole } from '@domain/entities';

import { AuthTokenTenantClaimDto } from './token-payload.dto';

export interface AuthenticatedTenantContextDto {
  tenantId: string;
  tenantUserId: string | null;
  role: TenantUserRole | null;
}

export interface AuthenticatedUserContextDto {
  userId: string;
  role: UserRole;
  isMaster: boolean;
  token: string;
  tenants: AuthTokenTenantClaimDto[];
  defaultTenantId: string | null;
}

export const AuthenticatedUserContext = {
  findTenant(
    context: AuthenticatedUserContextDto,
    tenantId: string,
  ): AuthTokenTenantClaimDto | undefined {
    return context.tenants.find((tenant) => tenant.tenantId === tenantId);
  },
  hasTenants(context: AuthenticatedUserContextDto): boolean {
    return context.tenants.length > 0;
  },
};
