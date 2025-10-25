import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { genId } from '@src/common/utils';

@Schema({
  collection: 'service_entry_access',
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class ServiceEntryAccessDocument extends Document {
  @Prop({
    type: String,
    default: () => genId(),
    immutable: true,
    unique: true,
    index: true,
  })
  service_entry_access_id: string;

  @Prop({ type: String, required: true, index: true })
  service_entry_id: string;

  @Prop({ type: String, required: true, unique: true })
  token_hash: string;

  @Prop({ type: Date, default: null })
  last_viewed_at?: Date | null;

  @Prop({ type: Date, default: null })
  downloaded_at?: Date | null;

  @Prop({ type: Number, default: 0 })
  download_count?: number;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

const ServiceEntryAccessSchema = SchemaFactory.createForClass(
  ServiceEntryAccessDocument,
);

export { ServiceEntryAccessSchema };
