import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { TenantStatus } from '@domain/entities';

import { genId } from '@src/common/utils';

@Schema({
  collection: 'tenants',
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  versionKey: false,
})
export class TenantDocument extends Document {
  @Prop({
    type: String,
    default: () => genId(),
    immutable: true,
    unique: true,
    index: true,
  })
  tenant_id: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true, unique: true, index: true })
  slug: string;

  @Prop({
    type: String,
    enum: Object.values(TenantStatus),
    required: true,
    index: true,
  })
  status: TenantStatus;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

const TenantSchema = SchemaFactory.createForClass(TenantDocument);

export { TenantSchema };
