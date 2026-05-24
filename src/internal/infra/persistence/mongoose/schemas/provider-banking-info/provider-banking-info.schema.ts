import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { genId } from '@src/common/utils';
import { ProviderBankingInfoStatus } from '@domain/entities';

export interface IProviderBankingInfoFormDocument {
  beneficiary: string;
  bank: string;
  account_number: string;
  clabe: string;
  credit_granted: string | null;
  notes: string | null;
}

@Schema({
  collection: 'provider_banking_infos',
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class ProviderBankingInfoDocument extends Document {
  @Prop({
    type: String,
    default: () => genId(),
    immutable: true,
    unique: true,
    index: true,
  })
  provider_banking_info_id: string;

  @Prop({ required: true, unique: true, index: true })
  provider_id: string;

  @Prop({
    type: String,
    enum: Object.values(ProviderBankingInfoStatus),
    default: ProviderBankingInfoStatus.PENDING,
    index: true,
  })
  status: ProviderBankingInfoStatus;

  @Prop({ type: Object, default: null })
  form_data?: IProviderBankingInfoFormDocument | null;

  @Prop({ type: String, default: null })
  bank_statement_file_id?: string | null;

  @Prop({ type: Date, default: null })
  submitted_at?: Date | null;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

const ProviderBankingInfoSchema = SchemaFactory.createForClass(
  ProviderBankingInfoDocument,
);

export { ProviderBankingInfoSchema };
