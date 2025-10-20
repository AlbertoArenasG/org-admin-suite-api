import { Injectable } from '@nestjs/common';

import { AuthenticateUserResultDto } from '@application/dto';

@Injectable()
export class AuthPresenter {
  async toLoginResponse(result: AuthenticateUserResultDto) {
    const response: Record<string, any> = {
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
      tenants: result.tenantAccesses.map((tenantAccess) => ({
        tenant_user_id: tenantAccess.tenantUserId,
        tenant_id: tenantAccess.tenantId,
        role: tenantAccess.role,
        status: tenantAccess.status,
        access_token: tenantAccess.accessToken,
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

    if (result.masterAccessToken) {
      response.master_access_token = result.masterAccessToken;
    }

    return response;
  }
}
