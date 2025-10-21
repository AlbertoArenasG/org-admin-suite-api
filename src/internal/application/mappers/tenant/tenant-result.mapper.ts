import { Tenant } from '@domain/entities';
import { CreateTenantResultDto } from '@application/dto';

export class TenantResultMapper {
  static toCreateTenantResultDto(tenant: Tenant): CreateTenantResultDto {
    const configs = tenant.configs;
    const theme = configs.theme;
    const appearance = configs.appearance;
    const createdAt = tenant.createdAt ?? new Date();
    const updatedAt = tenant.updatedAt ?? createdAt;

    return {
      id: tenant.id!,
      name: tenant.name,
      slug: tenant.slug,
      status: tenant.status,
      configs: {
        allowCustomRoles: configs.allowCustomRoles,
        featureFlags: { ...configs.featureFlags },
        theme: {
          light: { ...theme.light },
          dark: { ...theme.dark },
        },
        appearance: {
          logoUrl: appearance.logoUrl,
          faviconUrl: appearance.faviconUrl,
          bannerUrl: appearance.bannerUrl,
        },
      },
      createdAt,
      updatedAt,
    };
  }
}
