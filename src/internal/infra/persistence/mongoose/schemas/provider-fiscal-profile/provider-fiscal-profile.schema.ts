import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { genId } from '@src/common/utils';
import { ProviderFiscalProfileStatus } from '@domain/entities';

export interface IProviderFiscalProfileContactDocument {
  name: string;
  phone: string;
  email: string;
}

export interface IProviderFiscalProfileAddressDocument {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  postal_code: string;
}

export interface IProviderFiscalProfileFormDocument {
  business_name: string;
  rfc: string;
  address: IProviderFiscalProfileAddressDocument;
  billing_contact: IProviderFiscalProfileContactDocument;
  notes: string | null;
}

@Schema({
  collection: 'provider_fiscal_profiles',
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class ProviderFiscalProfileDocument extends Document {
  @Prop({
    type: String,
    default: () => genId(),
    immutable: true,
    unique: true,
    index: true,
  })
  provider_fiscal_profile_id: string;

  @Prop({ required: true, unique: true, index: true })
  provider_id: string;

  @Prop({
    type: String,
    enum: Object.values(ProviderFiscalProfileStatus),
    default: ProviderFiscalProfileStatus.PENDING,
    index: true,
  })
  status: ProviderFiscalProfileStatus;

  @Prop({ type: Object, default: null })
  form_data?: IProviderFiscalProfileFormDocument | null;

  @Prop({ type: String, default: null })
  tax_status_certificate_file_id?: string | null;

  @Prop({ type: String, default: null })
  tax_compliance_opinion_file_id?: string | null;

  @Prop({ type: String, default: null })
  address_proof_file_id?: string | null;

  @Prop({ type: Date, default: null })
  submitted_at?: Date | null;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

const ProviderFiscalProfileSchema = SchemaFactory.createForClass(
  ProviderFiscalProfileDocument,
);

export { ProviderFiscalProfileSchema };
