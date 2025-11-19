import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { genId } from '@src/common/utils';
import { CustomerFiscalProfileStatus } from '@domain/entities';

export interface CustomerFiscalProfileContactDocument {
  name: string;
  phone: string;
  email: string;
}

export interface CustomerFiscalProfileFormDocument {
  business_name: string;
  rfc: string;
  tax_regime: string;
  street: string;
  number: string;
  neighborhood: string;
  delegation: string;
  city: string;
  postal_code: string;
  cfdi_use: string;
  payment_method: string;
  payment_form: string;
  billing_contact: CustomerFiscalProfileContactDocument;
  accounts_payable_contact: CustomerFiscalProfileContactDocument;
  requirements_notes?: string | null;
}

@Schema({
  collection: 'customer_fiscal_profiles',
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class CustomerFiscalProfileDocument extends Document {
  @Prop({
    type: String,
    default: () => genId(),
    immutable: true,
    unique: true,
    index: true,
  })
  customer_fiscal_profile_id: string;

  @Prop({ required: true, unique: true, index: true })
  customer_id: string;

  @Prop({
    type: String,
    enum: Object.values(CustomerFiscalProfileStatus),
    default: CustomerFiscalProfileStatus.PENDING,
    index: true,
  })
  status: CustomerFiscalProfileStatus;

  @Prop({ type: Object, default: null })
  form_data?: CustomerFiscalProfileFormDocument | null;

  @Prop({ type: String, default: null })
  tax_certificate_file_id?: string | null;

  @Prop({ type: String, default: null })
  invoice_requirements_file_id?: string | null;

  @Prop({ type: Date, default: null })
  submitted_at?: Date | null;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

const CustomerFiscalProfileSchema = SchemaFactory.createForClass(
  CustomerFiscalProfileDocument,
);

export { CustomerFiscalProfileSchema };
