import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import {
  ExpirationNotificationPolicyAnchor,
  ExpirationNotificationPolicyRepeatUntil,
  ExpirationNotificationPolicyStatus,
  ExpirationNotificationPolicyTriggerMode,
} from '@domain/entities';

@Schema({ _id: false })
export class ExpirationNotificationPolicyOffsetDocument {
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
export class ExpirationNotificationPolicyRuleDocument {
  @Prop({ type: String, required: true })
  rule_id: string;

  @Prop({
    type: String,
    enum: Object.values(ExpirationNotificationPolicyAnchor),
    required: true,
  })
  anchor: ExpirationNotificationPolicyAnchor;

  @Prop({
    type: ExpirationNotificationPolicyOffsetDocument,
    required: true,
    default: {},
  })
  start_offset: ExpirationNotificationPolicyOffsetDocument;

  @Prop({
    type: String,
    enum: Object.values(ExpirationNotificationPolicyTriggerMode),
    required: true,
  })
  trigger_mode: ExpirationNotificationPolicyTriggerMode;

  @Prop({ type: [String], default: [] })
  recipient_group_ids: string[];

  @Prop({
    type: ExpirationNotificationPolicyOffsetDocument,
    required: false,
    default: null,
  })
  repeat_every?: ExpirationNotificationPolicyOffsetDocument | null;

  @Prop({
    type: String,
    enum: Object.values(ExpirationNotificationPolicyRepeatUntil),
    required: false,
    default: null,
  })
  repeat_until?: ExpirationNotificationPolicyRepeatUntil | null;

  @Prop({
    type: ExpirationNotificationPolicyOffsetDocument,
    required: false,
    default: null,
  })
  repeat_for?: ExpirationNotificationPolicyOffsetDocument | null;
}

@Schema({
  collection: 'expiration_notification_policies',
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class ExpirationNotificationPolicyDocument extends Document {
  @Prop({
    type: String,
    required: true,
    immutable: true,
    unique: true,
    index: true,
  })
  expiration_notification_policy_id: string;

  @Prop({ type: String, required: true, unique: true, index: true })
  name: string;

  @Prop({ type: String, required: true, unique: true, index: true })
  code: string;

  @Prop({ type: String, required: false, default: null })
  description?: string | null;

  @Prop({
    type: String,
    enum: Object.values(ExpirationNotificationPolicyStatus),
    default: ExpirationNotificationPolicyStatus.ACTIVE,
    index: true,
  })
  status: ExpirationNotificationPolicyStatus;

  @Prop({ type: [ExpirationNotificationPolicyRuleDocument], default: [] })
  rules: ExpirationNotificationPolicyRuleDocument[];

  @Prop({ type: String, required: false, default: null, index: true })
  created_by?: string | null;

  @Prop({ type: String, required: false, default: null })
  updated_by?: string | null;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const ExpirationNotificationPolicySchema = SchemaFactory.createForClass(
  ExpirationNotificationPolicyDocument,
);
