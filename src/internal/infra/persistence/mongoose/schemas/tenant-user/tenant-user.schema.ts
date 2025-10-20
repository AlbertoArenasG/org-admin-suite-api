import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { TenantUserRole, TenantUserStatus } from '@domain/entities';
import { genId } from '@src/common/utils';

@Schema({
  collection: 'tenant_users',
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class TenantUserDocument extends Document {
  @Prop({
    type: String,
    default: () => genId(),
    immutable: true,
    unique: true,
    index: true,
  })
  tenant_user_id: string;

  @Prop({ type: String, required: true, index: true })
  tenant_id: string;

  @Prop({ type: String, required: true, index: true })
  user_id: string;

  @Prop({
    type: String,
    enum: Object.values(TenantUserRole),
    required: true,
    index: true,
  })
  role: TenantUserRole;

  @Prop({
    type: String,
    enum: Object.values(TenantUserStatus),
    required: true,
    index: true,
    default: TenantUserStatus.ACTIVE,
  })
  status: TenantUserStatus;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

const TenantUserSchema = SchemaFactory.createForClass(TenantUserDocument);

export { TenantUserSchema };
