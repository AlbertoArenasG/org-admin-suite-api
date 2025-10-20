import { ValueObject } from '@src/internal/core/entities/value-object';

import { TENANT_THEME_DEFAULTS } from './defaults';

export interface TenantThemeModeProps {
  [token: string]: string;
}

export interface TenantThemeConfigProps {
  light?: TenantThemeModeProps;
  dark?: TenantThemeModeProps;
}

type TenantThemeConfigState = {
  light: TenantThemeModeProps;
  dark: TenantThemeModeProps;
};

export class TenantThemeConfig extends ValueObject<TenantThemeConfigState> {
  constructor(props: TenantThemeConfigProps = {}) {
    const light = {
      ...TENANT_THEME_DEFAULTS.light,
      ...(props.light ?? {}),
    };
    const dark = {
      ...TENANT_THEME_DEFAULTS.dark,
      ...(props.dark ?? {}),
    };

    super({
      light,
      dark,
    });
  }

  get light(): TenantThemeModeProps {
    return { ...this.props.light };
  }

  get dark(): TenantThemeModeProps {
    return { ...this.props.dark };
  }
}
