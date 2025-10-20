import { Tenant, TenantStatus } from '@domain/entities';
import {
  TenantConfigs,
  TenantConfigsInit,
  TenantThemeConfigProps,
} from '@domain/value-objects';
import {
  TenantAppearanceConfigDocument,
  TenantConfigsDocument,
  TenantDocument,
  TenantThemeConfigDocument,
} from '@infra/persistence/mongoose/schemas';

export type TenantAggregateDocuments = {
  tenant: TenantDocument | null;
  configs?: TenantConfigsDocument | null;
  theme?: TenantThemeConfigDocument | null;
  appearance?: TenantAppearanceConfigDocument | null;
};

export type TenantMongooseAggregate = {
  tenant: {
    tenant_id?: string;
    name: string;
    slug: string;
    status: TenantStatus;
  };
  configs: {
    tenant_id?: string;
    allow_custom_roles: boolean;
    feature_flags: Record<string, boolean>;
  };
  theme: {
    tenant_id?: string;
    light: Record<string, string>;
    dark: Record<string, string>;
  };
  appearance: {
    tenant_id?: string;
    logo_url: string | null;
    favicon_url: string | null;
    banner_url: string | null;
  };
};

export class MongooseTenantMapper {
  static toDomain(docs: TenantAggregateDocuments): Tenant | null {
    if (!docs?.tenant) return null;

    const configsDoc = docs.configs as any;
    const themeDoc = (docs.theme as any) ?? configsDoc?.theme;
    const appearanceDoc = docs.appearance as any;

    const featureFlags = this.mapFeatureFlags(docs.configs);

    const configsInit: TenantConfigsInit = {
      allowCustomRoles:
        configsDoc?.allow_custom_roles ?? configsDoc?.allowCustomRoles ?? false,
      featureFlags,
      theme: this.mapTheme(themeDoc),
      appearance: {
        logoUrl: appearanceDoc?.logo_url ?? appearanceDoc?.logoUrl ?? null,
        faviconUrl:
          appearanceDoc?.favicon_url ?? appearanceDoc?.faviconUrl ?? null,
        bannerUrl:
          appearanceDoc?.banner_url ?? appearanceDoc?.bannerUrl ?? null,
      },
    };

    return new Tenant({
      id: docs.tenant.tenant_id,
      name: docs.tenant.name,
      slug: docs.tenant.slug,
      status: docs.tenant.status,
      configs: new TenantConfigs(configsInit),
      createdAt: docs.tenant.createdAt,
      updatedAt: docs.tenant.updatedAt,
    });
  }

  static toMongoose(tenant: Tenant): TenantMongooseAggregate {
    const configs = tenant.configs;
    const theme = configs.theme;
    const appearance = configs.appearance;
    const tenantId = tenant.id;

    return {
      tenant: {
        ...(tenantId ? { tenant_id: tenantId } : {}),
        name: tenant.name,
        slug: tenant.slug,
        status: tenant.status,
      },
      configs: {
        ...(tenantId ? { tenant_id: tenantId } : {}),
        allow_custom_roles: configs.allowCustomRoles,
        feature_flags: { ...configs.featureFlags },
      },
      theme: {
        ...(tenantId ? { tenant_id: tenantId } : {}),
        light: { ...theme.light },
        dark: { ...theme.dark },
      },
      appearance: {
        ...(tenantId ? { tenant_id: tenantId } : {}),
        logo_url: appearance.logoUrl,
        favicon_url: appearance.faviconUrl,
        banner_url: appearance.bannerUrl,
      },
    };
  }

  private static mapFeatureFlags(
    configs?: TenantConfigsDocument | null,
  ): Record<string, boolean> | undefined {
    const configsDoc = configs as any;
    const featureFlagsDoc =
      configsDoc?.feature_flags ?? configsDoc?.featureFlags ?? undefined;
    if (!featureFlagsDoc) return undefined;

    if (featureFlagsDoc instanceof Map) {
      return Object.fromEntries(featureFlagsDoc.entries());
    }

    if (typeof (featureFlagsDoc as any).toObject === 'function') {
      return (featureFlagsDoc as any).toObject();
    }

    return featureFlagsDoc;
  }

  private static mapTheme(
    themeDoc?: TenantThemeConfigDocument | null,
  ): TenantThemeConfigProps {
    const theme = themeDoc as any;
    const normalize = (palette?: any): Record<string, string> | undefined => {
      if (!palette) return undefined;

      if (palette instanceof Map) {
        return Object.fromEntries(palette.entries());
      }

      if (typeof palette.toObject === 'function') {
        return palette.toObject();
      }

      if (typeof palette === 'object') {
        return { ...palette };
      }

      return undefined;
    };

    const light = normalize(theme?.light);
    const dark = normalize(theme?.dark);

    return {
      ...(light ? { light } : {}),
      ...(dark ? { dark } : {}),
    };
  }
}
