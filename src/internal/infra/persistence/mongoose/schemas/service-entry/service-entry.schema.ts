import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { ServiceEntryCategory } from '@domain/entities';
import { genId } from '@src/common/utils';

@Schema({
  collection: 'service_entries',
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class ServiceEntryDocument extends Document {
  @Prop({
    type: String,
    default: () => genId(),
    immutable: true,
    unique: true,
    index: true,
  })
  service_entry_id: string;

  @Prop({ required: true })
  company_name: string;

  @Prop({ required: true })
  contact_name: string;

  @Prop({ required: true })
  contact_email: string;

  @Prop({ required: true, unique: true, index: true })
  service_order_identifier: string;

  @Prop({
    type: String,
    enum: Object.values(ServiceEntryCategory),
    required: true,
  })
  category: ServiceEntryCategory;

  @Prop({ required: true })
  calibration_certificate_file_id: string;

  @Prop({ type: [String], default: [] })
  attachment_file_ids: string[];

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

const ServiceEntrySchema = SchemaFactory.createForClass(ServiceEntryDocument);

export { ServiceEntrySchema };
