import { ValueObject } from '@src/internal/core/entities/value-object';

export interface TenantThemeConfigProps {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  surfaceColor?: string;
}

export const TENANT_THEME_CONFIG_DEFAULTS: TenantThemeConfigProps =
  Object.freeze({
    primaryColor: '#111827',
    secondaryColor: '#6366F1',
    accentColor: '#22C55E',
    surfaceColor: '#FFFFFF',
  });

export class TenantThemeConfig extends ValueObject<TenantThemeConfigProps> {
  constructor(props: TenantThemeConfigProps = {}) {
    const merged: TenantThemeConfigProps = {
      ...TENANT_THEME_CONFIG_DEFAULTS,
      ...props,
    };

    super(merged);
  }

  get primaryColor(): string {
    return this.props.primaryColor;
  }

  get secondaryColor(): string {
    return this.props.secondaryColor;
  }

  get accentColor(): string {
    return this.props.accentColor;
  }

  get surfaceColor(): string {
    return this.props.surfaceColor;
  }
}
