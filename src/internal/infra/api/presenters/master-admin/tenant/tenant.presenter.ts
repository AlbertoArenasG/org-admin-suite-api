import { Injectable } from '@nestjs/common';

import { CreateTenantResultDto } from '@application/dto';

@Injectable()
export class TenantPresenter {
  async toTenantResponse(result: CreateTenantResultDto) {
    return {
      id: result.id,
      name: result.name,
      slug: result.slug,
      status: result.status,
      configs: {
        allow_custom_roles: result.configs.allowCustomRoles,
        feature_flags: result.configs.featureFlags,
        theme: {
          primary_color: result.configs.theme.primaryColor,
          secondary_color: result.configs.theme.secondaryColor,
          accent_color: result.configs.theme.accentColor,
          surface_color: result.configs.theme.surfaceColor,
        },
        appearance: {
          logo_url: result.configs.appearance.logoUrl,
          favicon_url: result.configs.appearance.faviconUrl,
          banner_url: result.configs.appearance.bannerUrl,
        },
      },
      created_at: result.createdAt,
      updated_at: result.updatedAt,
    };
  }
}
