import { ValueObject } from '@src/internal/core/entities/value-object';

import { TENANT_APPEARANCE_DEFAULTS } from './defaults';

export interface TenantAppearanceConfigProps {
  logoUrl?: string | null;
  faviconUrl?: string | null;
  bannerUrl?: string | null;
}

export class TenantAppearanceConfig extends ValueObject<TenantAppearanceConfigProps> {
  constructor(props: TenantAppearanceConfigProps = {}) {
    const merged: TenantAppearanceConfigProps = {
      ...TENANT_APPEARANCE_DEFAULTS,
      ...props,
    };

    super(merged);
  }

  get logoUrl(): string | null {
    return this.props.logoUrl;
  }

  get faviconUrl(): string | null {
    return this.props.faviconUrl;
  }

  get bannerUrl(): string | null {
    return this.props.bannerUrl;
  }
}
