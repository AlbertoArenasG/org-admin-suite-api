import { ValueObject } from '@src/internal/core/entities/value-object';

import {
  TenantAppearanceConfig,
  TenantAppearanceConfigProps,
  TenantThemeConfig,
  TenantThemeConfigProps,
  TENANT_CONFIGS_DEFAULTS,
} from '.';

export interface TenantConfigsProps {
  theme: TenantThemeConfig;
  appearance: TenantAppearanceConfig;
  allowCustomRoles: boolean;
  featureFlags: Record<string, boolean>;
}

export type TenantConfigsInit = {
  theme?: TenantThemeConfig | TenantThemeConfigProps;
  appearance?: TenantAppearanceConfig | TenantAppearanceConfigProps;
  allowCustomRoles?: boolean;
  featureFlags?: Record<string, boolean>;
};

export class TenantConfigs extends ValueObject<TenantConfigsProps> {
  constructor(init: TenantConfigsInit = {}) {
    const theme =
      init.theme instanceof TenantThemeConfig
        ? init.theme
        : new TenantThemeConfig(init.theme);
    const appearance =
      init.appearance instanceof TenantAppearanceConfig
        ? init.appearance
        : new TenantAppearanceConfig(init.appearance);

    const props: TenantConfigsProps = {
      theme,
      appearance,
      allowCustomRoles:
        init.allowCustomRoles ?? TENANT_CONFIGS_DEFAULTS.allowCustomRoles,
      featureFlags: {
        ...TENANT_CONFIGS_DEFAULTS.featureFlags,
        ...(init.featureFlags ?? {}),
      },
    };

    super(props);
  }

  get theme(): TenantThemeConfig {
    return this.props.theme;
  }

  get appearance(): TenantAppearanceConfig {
    return this.props.appearance;
  }

  get allowCustomRoles(): boolean {
    return this.props.allowCustomRoles;
  }

  get featureFlags(): Record<string, boolean> {
    return { ...this.props.featureFlags };
  }

  withUpdatedFlags(featureFlags: Record<string, boolean>): TenantConfigs {
    return new TenantConfigs({
      theme: this.theme,
      appearance: this.appearance,
      allowCustomRoles: this.allowCustomRoles,
      featureFlags,
    });
  }

  static createDefault(): TenantConfigs {
    return new TenantConfigs();
  }
}
