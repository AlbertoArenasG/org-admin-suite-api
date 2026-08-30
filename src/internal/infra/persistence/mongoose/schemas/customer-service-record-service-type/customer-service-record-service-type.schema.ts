import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { CustomerServiceRecordServiceTypeStatus } from '@domain/entities';

@Schema({
  collection: 'customer_service_record_service_types',
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class CustomerServiceRecordServiceTypeDocument extends Document {
  @Prop({
    type: String,
    required: true,
    immutable: true,
    unique: true,
    index: true,
  })
  customer_service_record_service_type_id: string;
  @Prop({
    type: String,
    required: true,
    immutable: true,
    unique: true,
    index: true,
  })
  code: string;
  @Prop({
    type: String,
    required: true,
    immutable: true,
    unique: true,
    index: true,
  })
  name: string;
  @Prop({
    type: String,
    enum: Object.values(CustomerServiceRecordServiceTypeStatus),
    required: true,
    default: CustomerServiceRecordServiceTypeStatus.ACTIVE,
    index: true,
  })
  status: CustomerServiceRecordServiceTypeStatus;
  @Prop({ type: String, required: false, default: null, index: true })
  created_by?: string | null;
  @Prop({ type: String, required: false, default: null }) updated_by?:
    | string
    | null;
  @Prop() createdAt?: Date;
  @Prop() updatedAt?: Date;
}

export const CustomerServiceRecordServiceTypeSchema =
  SchemaFactory.createForClass(CustomerServiceRecordServiceTypeDocument);
