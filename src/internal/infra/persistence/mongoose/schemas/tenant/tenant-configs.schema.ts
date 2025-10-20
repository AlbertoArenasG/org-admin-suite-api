import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { TENANT_CONFIGS_DEFAULTS } from '@domain/value-objects';

@Schema({
  collection: 'tenant_configs',
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  versionKey: false,
})
export class TenantConfigsDocument extends Document {
  @Prop({ type: String })
  tenant_id: string;

  @Prop({
    type: Boolean,
    default: () => TENANT_CONFIGS_DEFAULTS.allowCustomRoles,
  })
  allow_custom_roles: boolean;

  @Prop({
    type: Map,
    of: Boolean,
    default: () => ({ ...TENANT_CONFIGS_DEFAULTS.featureFlags }),
  })
  feature_flags: Record<string, boolean>;
}

const TenantConfigsSchema = SchemaFactory.createForClass(TenantConfigsDocument);

export { TenantConfigsSchema };
