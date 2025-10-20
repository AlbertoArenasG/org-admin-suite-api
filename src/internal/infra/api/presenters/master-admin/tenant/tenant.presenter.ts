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
        feature_flags: { ...result.configs.featureFlags },
        theme: {
          light: { ...result.configs.theme.light },
          dark: { ...result.configs.theme.dark },
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
