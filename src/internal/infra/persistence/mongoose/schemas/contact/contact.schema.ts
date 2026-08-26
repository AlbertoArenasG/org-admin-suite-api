import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { genId } from '@src/common/utils';
import { ContactStatus } from '@domain/entities';
import {
  ContactValueSchema,
  IContactValueSchema,
} from '../shared/contact-value.schema';

@Schema({
  collection: 'contacts',
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class ContactDocument extends Document {
  @Prop({
    type: String,
    default: () => genId(),
    immutable: true,
    unique: true,
    index: true,
  })
  contact_id: string;

  @Prop({ type: String, required: false, default: null, index: true })
  user_id?: string | null;

  @Prop({ type: String, required: true, trim: true, index: true })
  name: string;

  @Prop({ type: String, required: true, trim: true, index: true })
  lastname: string;

  @Prop({ type: String, required: true, trim: true, index: true })
  full_name: string;

  @Prop({ type: [String], default: [], index: true })
  company_names: string[];

  @Prop({ type: [ContactValueSchema], default: [] })
  emails: IContactValueSchema[];

  @Prop({ type: [ContactValueSchema], default: [] })
  phones: IContactValueSchema[];

  @Prop({ type: [ContactValueSchema], default: [] })
  cell_phones: IContactValueSchema[];

  @Prop({
    type: String,
    enum: Object.values(ContactStatus),
    default: ContactStatus.ACTIVE,
    index: true,
  })
  status: ContactStatus;

  @Prop({ type: String, required: false, default: null, index: true })
  created_by?: string | null;

  @Prop({ type: String, required: false, default: null })
  updated_by?: string | null;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

const ContactSchema = SchemaFactory.createForClass(ContactDocument);

ContactSchema.index({ full_name: 'text', company_names: 'text' });

export { ContactSchema };
