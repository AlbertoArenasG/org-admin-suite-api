import { Tenant, TenantUser, User } from '@domain/entities';
import {
  AuthenticatedTenantAccessDto,
  AuthenticateUserResultDto,
} from '@application/dto';
import { UserResultMapper } from '@application/mappers/user/user-result.mapper';

interface TenantAccessParams {
  tenantUser: TenantUser;
  tenant: Tenant | null;
  accessToken: string;
}

export class AuthenticateUserResultMapper {
  static toResult(
    user: User,
    masterAccessToken: string | undefined,
    tenantAccesses: AuthenticatedTenantAccessDto[],
  ): AuthenticateUserResultDto {
    return {
      user: UserResultMapper.toAuthenticatedUserDto(user),
      masterAccessToken,
      tenantAccesses,
    };
  }

  static toTenantAccessDto({
    tenantUser,
    tenant,
    accessToken,
  }: TenantAccessParams): AuthenticatedTenantAccessDto | null {
    return {
      tenantUserId: tenantUser.id!,
      tenantId: tenantUser.tenantId,
      role: tenantUser.role,
      status: tenantUser.status,
      accessToken,
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
