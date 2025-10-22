import { Tenant, TenantUser, User } from '@domain/entities';
import {
  AuthenticatedTenantAccessDto,
  AuthenticateUserResultDto,
} from '@application/dto';
import { UserResultMapper } from '@application/mappers/user/user-result.mapper';

export class AuthenticateUserResultMapper {
  static toResult(
    user: User,
    accessToken: string,
    tenants: AuthenticatedTenantAccessDto[],
    defaultTenantId: string | null,
  ): AuthenticateUserResultDto {
    return {
      user: UserResultMapper.toAuthenticatedUserDto(user),
      accessToken,
      tenants,
      defaultTenantId,
    };
  }

  static toTenantAccessDto(
    tenantUser: TenantUser,
    tenant: Tenant | null,
  ): AuthenticatedTenantAccessDto | null {
    return {
      tenantUserId: tenantUser.id!,
      tenantId: tenantUser.tenantId,
      role: tenantUser.role,
      status: tenantUser.status,
      tenant: tenant
        ? {
            id: tenant.id ?? tenant.currentState.id ?? tenant.slug,
            name: tenant.name,
            slug: tenant.slug,
            status: tenant.status,
          }
        : null,
    };
  }
}
