import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { CreateTenantDto } from '@application/dto';
import { TenantStatus } from '@domain/entities';
import { TenantConfigsInit } from '@domain/value-objects';

export class TenantThemeRequestDto {
  @IsOptional()
  @IsObject()
  light?: Record<string, string>;

  @IsOptional()
  @IsObject()
  dark?: Record<string, string>;

  toDomain(): TenantConfigsInit['theme'] {
    const sanitize = (palette?: Record<string, any>) =>
      palette
        ? Object.entries(palette).reduce<Record<string, string>>(
            (acc, [key, value]) => {
              if (typeof value === 'string') {
                acc[key] = value;
              }
              return acc;
            },
            {},
          )
        : undefined;

    return {
      light: sanitize(this.light),
      dark: sanitize(this.dark),
    };
  }
}

export class TenantAppearanceRequestDto {
  @IsOptional()
  @IsString()
  logo_url?: string | null;

  @IsOptional()
  @IsString()
  favicon_url?: string | null;

  @IsOptional()
  @IsString()
  banner_url?: string | null;

  toDomain(): TenantConfigsInit['appearance'] {
    return {
      logoUrl: this.logo_url ?? null,
      faviconUrl: this.favicon_url ?? null,
      bannerUrl: this.banner_url ?? null,
    };
  }
}

export class TenantConfigsRequestDto {
  @IsOptional()
  @IsBoolean()
  allow_custom_roles?: boolean;

  @IsOptional()
  @IsObject()
  feature_flags?: Record<string, boolean>;

  @IsOptional()
  @Type(() => TenantThemeRequestDto)
  @ValidateNested()
  theme?: TenantThemeRequestDto;

  @IsOptional()
  @Type(() => TenantAppearanceRequestDto)
  @ValidateNested()
  appearance?: TenantAppearanceRequestDto;

  toDomain(): TenantConfigsInit {
    const featureFlags = this.feature_flags
      ? Object.entries(this.feature_flags).reduce<Record<string, boolean>>(
          (acc, [key, value]) => {
            if (typeof value === 'boolean') {
              acc[key] = value;
            }
            return acc;
          },
          {},
        )
      : undefined;

    return {
      allowCustomRoles: this.allow_custom_roles,
      featureFlags,
      theme: this.theme?.toDomain(),
      appearance: this.appearance?.toDomain(),
    };
  }
}

export class CreateTenantRequestDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  slug!: string;

  @IsOptional()
  @IsIn(Object.values(TenantStatus))
  status?: TenantStatus;

  @IsOptional()
  @Type(() => TenantConfigsRequestDto)
  @ValidateNested()
  configs?: TenantConfigsRequestDto;

  toDomain(): CreateTenantDto {
    const configs = this.configs?.toDomain();
    return {
      name: this.name,
      slug: this.slug,
      status: this.status,
      configs,
    };
  }
}
