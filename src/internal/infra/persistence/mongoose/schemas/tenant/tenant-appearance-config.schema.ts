import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { TENANT_APPEARANCE_CONFIG_DEFAULTS } from '@domain/value-objects';

@Schema({
  collection: 'tenant_appearance_configs',
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  versionKey: false,
})
export class TenantAppearanceConfigDocument extends Document {
  @Prop({ type: String })
  tenant_id: string;

  @Prop({ type: String, default: TENANT_APPEARANCE_CONFIG_DEFAULTS.logoUrl })
  logo_url: string;

  @Prop({ type: String, default: TENANT_APPEARANCE_CONFIG_DEFAULTS.faviconUrl })
  favicon_url: string;

  @Prop({ type: String, default: TENANT_APPEARANCE_CONFIG_DEFAULTS.bannerUrl })
  banner_url: string;
}

const TenantAppearanceConfigSchema = SchemaFactory.createForClass(
  TenantAppearanceConfigDocument,
);

export { TenantAppearanceConfigSchema };
