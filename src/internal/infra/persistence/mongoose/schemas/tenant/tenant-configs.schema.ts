import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

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

  @Prop({ type: Boolean, default: false })
  allow_custom_roles: boolean;

  @Prop({ type: Map, of: Boolean, default: {} })
  feature_flags: Record<string, boolean>;
}

const TenantConfigsSchema = SchemaFactory.createForClass(TenantConfigsDocument);

export { TenantConfigsSchema };
