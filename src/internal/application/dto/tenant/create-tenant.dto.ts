import { TenantStatus } from '@domain/entities';
import { TenantConfigsInit } from '@domain/value-objects';

export interface CreateTenantDto {
  name: string;
  slug: string;
  status?: TenantStatus;
  configs?: TenantConfigsInit;
}

export interface TenantConfigsResultDto {
  allowCustomRoles: boolean;
  featureFlags: Record<string, boolean>;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    surfaceColor: string;
  };
  appearance: {
    logoUrl: string | null;
    faviconUrl: string | null;
    bannerUrl: string | null;
  };
}

export interface CreateTenantResultDto {
  id: string;
  name: string;
  slug: string;
  status: TenantStatus;
  configs: TenantConfigsResultDto;
  createdAt: Date;
  updatedAt: Date;
}
