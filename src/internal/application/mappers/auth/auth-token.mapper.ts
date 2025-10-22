import { User, UserRole } from '@domain/entities';
import {
  AuthTokenPayloadDto,
  AuthTokenTenantClaimDto,
  AuthenticatedTenantAccessDto,
} from '@application/dto';

export interface TenantAccessAggregate {
  tenantAccess: AuthenticatedTenantAccessDto;
  claim: AuthTokenTenantClaimDto;
}

export class AuthTokenMapper {
  static toUnifiedPayload(
    user: User,
    tenantAccesses: TenantAccessAggregate[],
    defaultTenantId: string | null,
  ): AuthTokenPayloadDto {
    return {
      sub: user.id!,
      role: user.role,
      isMaster: AuthTokenMapper.isMaster(user.role),
      tenants: tenantAccesses.map(({ claim }) => claim),
      defaultTenantId,
    };
  }

  static buildTenantClaim(
    tenantAccess: AuthenticatedTenantAccessDto,
  ): AuthTokenTenantClaimDto {
    return {
      tenantId: tenantAccess.tenantId,
      tenantUserId: tenantAccess.tenantUserId,
      role: tenantAccess.role,
    };
  }

  private static isMaster(role: UserRole): boolean {
    return role === UserRole.MASTER_ADMIN || role === UserRole.MASTER_STAFF;
  }
}
