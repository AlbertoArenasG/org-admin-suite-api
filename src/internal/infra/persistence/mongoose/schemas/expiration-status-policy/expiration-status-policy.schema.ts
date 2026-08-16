import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { ExpirationStatusPolicyStatus } from '@domain/entities';

@Schema({ _id: false })
export class ExpirationStatusPolicyOffsetDocument {
  @Prop({ type: Number, default: 0 })
  years: number;

  @Prop({ type: Number, default: 0 })
  months: number;

  @Prop({ type: Number, default: 0 })
  weeks: number;

  @Prop({ type: Number, default: 0 })
  days: number;
}

@Schema({ _id: false })
export class ExpirationStatusPolicyRuleDocument {
  @Prop({ type: String, required: true })
  rule_id: string;

  @Prop({
    type: ExpirationStatusPolicyOffsetDocument,
    required: true,
    default: {},
  })
  start_offset: ExpirationStatusPolicyOffsetDocument;

  @Prop({ type: String, required: true })
  label: string;

  @Prop({ type: String, required: true })
  color_hex: string;
}

@Schema({
  collection: 'expiration_status_policies',
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class ExpirationStatusPolicyDocument extends Document {
  @Prop({
    type: String,
    required: true,
    immutable: true,
    unique: true,
    index: true,
  })
  expiration_status_policy_id: string;

  @Prop({ type: String, required: true, unique: true, index: true })
  name: string;

  @Prop({ type: String, required: true, unique: true, index: true })
  code: string;

  @Prop({ type: String, required: false, default: null })
  description?: string | null;

  @Prop({
    type: String,
    enum: Object.values(ExpirationStatusPolicyStatus),
    default: ExpirationStatusPolicyStatus.ACTIVE,
    index: true,
  })
  status: ExpirationStatusPolicyStatus;

  @Prop({ type: [ExpirationStatusPolicyRuleDocument], default: [] })
  rules: ExpirationStatusPolicyRuleDocument[];

  @Prop({ type: String, required: false, default: null, index: true })
  created_by?: string | null;

  @Prop({ type: String, required: false, default: null })
  updated_by?: string | null;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const ExpirationStatusPolicySchema = SchemaFactory.createForClass(
  ExpirationStatusPolicyDocument,
);
