import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { genId } from '@src/common/utils';
import { CustomerStatus } from '@domain/entities';

@Schema({
  collection: 'customers',
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class CustomerDocument extends Document {
  @Prop({
    type: String,
    default: () => genId(),
    immutable: true,
    unique: true,
    index: true,
  })
  customer_id: string;

  @Prop({ required: true })
  company_name: string;

  @Prop({ required: true, unique: true, index: true })
  client_code: string;

  @Prop({ required: true, unique: true, index: true })
  access_token: string;

  @Prop({
    type: String,
    enum: Object.values(CustomerStatus),
    default: CustomerStatus.ACTIVE,
    index: true,
  })
  status: CustomerStatus;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

const CustomerSchema = SchemaFactory.createForClass(CustomerDocument);

export { CustomerSchema };
