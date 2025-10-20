import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { TENANT_THEME_DEFAULTS } from '@domain/value-objects';

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

  @Prop({
    type: Map,
    of: String,
    default: () => ({ ...TENANT_THEME_DEFAULTS.light }),
  })
  light: Record<string, string>;

  @Prop({
    type: Map,
    of: String,
    default: () => ({ ...TENANT_THEME_DEFAULTS.dark }),
  })
  dark: Record<string, string>;
}

const TenantThemeConfigSchema = SchemaFactory.createForClass(
  TenantThemeConfigDocument,
);

export { TenantThemeConfigSchema };
