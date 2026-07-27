import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { genId } from '@src/common/utils';
import { CatalogStatus } from '@domain/entities';

@Schema({
  collection: 'permission_modules',
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class PermissionModuleDocument extends Document {
  @Prop({
    type: String,
    default: () => genId(),
    immutable: true,
    unique: true,
    index: true,
  })
  permission_module_id: string;

  @Prop({ type: String, required: true, unique: true, index: true })
  code: string;

  @Prop({ type: String, required: true, unique: true, index: true })
  name: string;

  @Prop({
    type: String,
    enum: Object.values(CatalogStatus),
    default: CatalogStatus.ACTIVE,
    index: true,
  })
  status: CatalogStatus;

  @Prop({ type: Boolean, required: true, default: true, index: true })
  is_system: boolean;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const PermissionModuleSchema = SchemaFactory.createForClass(
  PermissionModuleDocument,
);
