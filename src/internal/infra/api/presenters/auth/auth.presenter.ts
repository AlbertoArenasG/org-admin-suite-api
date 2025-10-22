import { Injectable } from '@nestjs/common';

import { AuthenticateUserResultDto } from '@application/dto';

@Injectable()
export class AuthPresenter {
  async toLoginResponse(result: AuthenticateUserResultDto) {
    const response: Record<string, any> = {
      access_token: result.accessToken,
      user: {
        id: result.user.id,
        name: result.user.name,
        lastname: result.user.lastname,
        email: result.user.email,
        role: result.user.role,
        status: result.user.status,
        cell_phone: {
          country_code: result.user.cellPhone?.countryCode ?? null,
          number: result.user.cellPhone?.number ?? null,
        },
      },
      tenants: result.tenants.map((tenantAccess) => ({
        tenant_user_id: tenantAccess.tenantUserId,
        tenant_id: tenantAccess.tenantId,
        role: tenantAccess.role,
        status: tenantAccess.status,
        tenant: tenantAccess.tenant
          ? {
              id: tenantAccess.tenant.id,
              name: tenantAccess.tenant.name,
              slug: tenantAccess.tenant.slug,
              status: tenantAccess.tenant.status,
            }
          : null,
      })),
    };

    if (result.defaultTenantId) {
      response.default_tenant_id = result.defaultTenantId;
    }

    return response;
  }
}
