import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { RecipientGroupStatus } from '@domain/entities';

@Schema({
  collection: 'recipient_groups',
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class RecipientGroupDocument extends Document {
  @Prop({
    type: String,
    required: true,
    immutable: true,
    unique: true,
    index: true,
  })
  recipient_group_id: string;

  @Prop({ type: String, required: true, unique: true, index: true })
  name: string;

  @Prop({ type: String, required: true, unique: true, index: true })
  code: string;

  @Prop({ type: String, required: false, default: null })
  description?: string | null;

  @Prop({ type: [String], default: [] })
  enabled_channels: string[];

  @Prop({ type: [String], default: [] })
  contact_ids: string[];

  @Prop({
    type: String,
    enum: Object.values(RecipientGroupStatus),
    default: RecipientGroupStatus.ACTIVE,
    index: true,
  })
  status: RecipientGroupStatus;

  @Prop({ type: String, required: false, default: null, index: true })
  created_by?: string | null;

  @Prop({ type: String, required: false, default: null })
  updated_by?: string | null;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const RecipientGroupSchema = SchemaFactory.createForClass(
  RecipientGroupDocument,
);
