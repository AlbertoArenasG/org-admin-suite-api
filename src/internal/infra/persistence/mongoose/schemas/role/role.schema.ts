import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { genId } from '@src/common/utils';
import { RoleScope, RoleStatus } from '@domain/entities';

export interface IRolePermissionSchema {
  module: string;
  operation: string;
}

@Schema({
  collection: 'roles',
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class RoleDocument extends Document {
  @Prop({
    type: String,
    default: () => genId(),
    immutable: true,
    unique: true,
    index: true,
  })
  role_id: string;

  @Prop({ type: String, required: true, unique: true, index: true })
  name: string;

  @Prop({ type: String, required: true, unique: true, index: true })
  code: string;

  @Prop({
    type: String,
    enum: Object.values(RoleScope),
    required: true,
    index: true,
  })
  scope: RoleScope;

  @Prop({ type: Boolean, required: true, index: true })
  is_system: boolean;

  @Prop({ type: Boolean, required: true, index: true })
  is_immutable: boolean;

  @Prop({ type: Boolean, required: true, index: true })
  is_default: boolean;

  @Prop({
    type: String,
    enum: Object.values(RoleStatus),
    default: RoleStatus.ACTIVE,
    index: true,
  })
  status: RoleStatus;

  @Prop({
    type: [
      {
        module: { type: String, required: true },
        operation: { type: String, required: true },
      },
    ],
    default: [],
  })
  permissions: IRolePermissionSchema[];

  @Prop({ type: String, required: false, default: null, index: true })
  created_by?: string | null;

  @Prop({ type: String, required: false, default: null })
  updated_by?: string | null;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const RoleSchema = SchemaFactory.createForClass(RoleDocument);
