import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { genId } from '@src/common/utils';
import { ProviderStatus } from '@domain/entities';

export interface IProviderContactSchema {
  name: string;
  phone: string;
  email: string;
}

@Schema({
  collection: 'providers',
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class ProviderDocument extends Document {
  @Prop({
    type: String,
    default: () => genId(),
    immutable: true,
    unique: true,
    index: true,
  })
  provider_id: string;

  @Prop({ required: true })
  company_name: string;

  @Prop({ required: true, unique: true, index: true })
  provider_code: string;

  @Prop({ required: true, unique: true, index: true })
  access_token: string;

  @Prop({ type: Object, required: true })
  contact: IProviderContactSchema;

  @Prop({
    type: String,
    enum: Object.values(ProviderStatus),
    default: ProviderStatus.ACTIVE,
    index: true,
  })
  status: ProviderStatus;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

const ProviderSchema = SchemaFactory.createForClass(ProviderDocument);

export { ProviderSchema };
