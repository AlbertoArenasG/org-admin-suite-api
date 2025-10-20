import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { TENANT_THEME_CONFIG_DEFAULTS } from '@domain/value-objects';

@Schema({
  collection: 'tenant_theme_configs',
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  versionKey: false,
})
export class TenantThemeConfigDocument extends Document {
  @Prop({ type: String })
  tenant_id: string;

  @Prop({ type: String, default: TENANT_THEME_CONFIG_DEFAULTS.primaryColor })
  primary_color: string;

  @Prop({ type: String, default: TENANT_THEME_CONFIG_DEFAULTS.secondaryColor })
  secondary_color: string;

  @Prop({ type: String, default: TENANT_THEME_CONFIG_DEFAULTS.accentColor })
  accent_color: string;

  @Prop({ type: String, default: TENANT_THEME_CONFIG_DEFAULTS.surfaceColor })
  surface_color: string;
}

const TenantThemeConfigSchema = SchemaFactory.createForClass(
  TenantThemeConfigDocument,
);

export { TenantThemeConfigSchema };
