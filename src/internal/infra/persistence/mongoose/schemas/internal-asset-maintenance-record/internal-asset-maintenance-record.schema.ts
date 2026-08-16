import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import {
  InternalAssetExpirationStatusMaterializationSource,
  InternalAssetNotificationTriggerEventStatus,
  InternalAssetMaintenanceRecordStatus,
  InternalAssetMaintenanceType,
} from '@domain/entities';

@Schema({ _id: false })
export class InternalAssetMaintenanceIntervalDocument {
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
export class InternalAssetMaintenanceProviderDocument {
  @Prop({ type: Boolean, default: false })
  sent_to_provider: boolean;

  @Prop({ type: String, required: false, default: null })
  provider_name?: string | null;

  @Prop({ type: String, required: false, default: null })
  sent_to_provider_at?: string | null;

  @Prop({
    type: InternalAssetMaintenanceIntervalDocument,
    required: false,
    default: null,
  })
  provider_lead_time?: InternalAssetMaintenanceIntervalDocument | null;

  @Prop({ type: String, required: false, default: null })
  provider_notes?: string | null;
}

@Schema({ _id: false })
export class InternalAssetExpirationStatusMatchedRuleDocument {
  @Prop({ type: String, required: true })
  source_rule_id: string;

  @Prop({
    type: InternalAssetMaintenanceIntervalDocument,
    required: true,
    default: {},
  })
  start_offset: InternalAssetMaintenanceIntervalDocument;
}

@Schema({ _id: false })
export class InternalAssetExpirationStatusMaterializationDocument {
  @Prop({
    type: String,
    enum: Object.values(InternalAssetExpirationStatusMaterializationSource),
    required: true,
  })
  source: InternalAssetExpirationStatusMaterializationSource;

  @Prop({ type: String, required: true })
  code: string;

  @Prop({ type: String, required: false, default: null })
  effective_start_date?: string | null;

  @Prop({ type: String, required: true })
  label: string;

  @Prop({ type: String, required: false, default: null })
  label_key?: string | null;

  @Prop({ type: String, required: true })
  color_hex: string;

  @Prop({
    type: InternalAssetExpirationStatusMatchedRuleDocument,
    required: false,
    default: null,
  })
  matched_rule?: InternalAssetExpirationStatusMatchedRuleDocument | null;

  @Prop({ type: Date, required: true })
  last_materialized_at: Date;
}

@Schema({ _id: false })
export class InternalAssetNotificationTriggerEventDocument {
  @Prop({ type: String, required: true })
  trigger_date: string;

  @Prop({
    type: String,
    enum: Object.values(InternalAssetNotificationTriggerEventStatus),
    required: true,
  })
  status: InternalAssetNotificationTriggerEventStatus;

  @Prop({ type: Date, required: false, default: null })
  triggered_at?: Date | null;

  @Prop({ type: String, required: false, default: null })
  failure_reason?: string | null;
}

@Schema({ _id: false })
export class InternalAssetNotificationMaterializedRuleDocument {
  @Prop({ type: String, required: true })
  source_rule_id: string;

  @Prop({ type: String, required: true })
  anchor: string;

  @Prop({
    type: InternalAssetMaintenanceIntervalDocument,
    required: true,
    default: {},
  })
  start_offset: InternalAssetMaintenanceIntervalDocument;

  @Prop({ type: String, required: true })
  trigger_mode: string;

  @Prop({
    type: InternalAssetMaintenanceIntervalDocument,
    required: false,
    default: null,
  })
  repeat_every?: InternalAssetMaintenanceIntervalDocument | null;

  @Prop({ type: String, required: false, default: null })
  repeat_until?: string | null;

  @Prop({
    type: InternalAssetMaintenanceIntervalDocument,
    required: false,
    default: null,
  })
  repeat_for?: InternalAssetMaintenanceIntervalDocument | null;

  @Prop({
    type: [InternalAssetNotificationTriggerEventDocument],
    required: true,
    default: [],
  })
  trigger_events: InternalAssetNotificationTriggerEventDocument[];

  @Prop({ type: Date, required: false, default: null })
  last_triggered_at?: Date | null;
}

@Schema({ _id: false })
export class InternalAssetExpirationNotificationMaterializationDocument {
  @Prop({
    type: String,
    enum: Object.values(InternalAssetExpirationStatusMaterializationSource),
    required: true,
  })
  source: InternalAssetExpirationStatusMaterializationSource;

  @Prop({ type: String, required: false, default: null })
  next_trigger_date?: string | null;

  @Prop({ type: Date, required: false, default: null })
  last_triggered_at?: Date | null;

  @Prop({ type: Number, required: true, default: 0 })
  materialized_rules_count: number;

  @Prop({
    type: [InternalAssetNotificationMaterializedRuleDocument],
    required: true,
    default: [],
  })
  materialized_rules: InternalAssetNotificationMaterializedRuleDocument[];

  @Prop({ type: Date, required: true })
  last_materialized_at: Date;
}

@Schema({
  collection: 'internal_asset_maintenance_records',
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class InternalAssetMaintenanceRecordDocument extends Document {
  @Prop({
    type: String,
    required: true,
    immutable: true,
    unique: true,
    index: true,
  })
  internal_asset_maintenance_record_id: string;

  @Prop({ type: String, required: true, index: true })
  asset_name: string;

  @Prop({ type: String, required: true, index: true })
  asset_identifier: string;

  @Prop({
    type: String,
    enum: Object.values(InternalAssetMaintenanceType),
    required: true,
    index: true,
  })
  asset_maintenance_type: InternalAssetMaintenanceType;

  @Prop({ type: String, required: true, index: true })
  last_maintenance_at: string;

  @Prop({
    type: InternalAssetMaintenanceIntervalDocument,
    required: true,
    default: {},
  })
  interval: InternalAssetMaintenanceIntervalDocument;

  @Prop({ type: String, required: true, index: true })
  expiration_date: string;

  @Prop({ type: String, required: false, default: null })
  observations?: string | null;

  @Prop({
    type: String,
    enum: Object.values(InternalAssetMaintenanceRecordStatus),
    default: InternalAssetMaintenanceRecordStatus.PENDING,
    index: true,
  })
  status: InternalAssetMaintenanceRecordStatus;

  @Prop({ type: String, required: false, default: null, index: true })
  expiration_status_policy_id?: string | null;

  @Prop({ type: String, required: false, default: null, index: true })
  expiration_notification_policy_id?: string | null;

  @Prop({
    type: InternalAssetMaintenanceProviderDocument,
    required: false,
    default: null,
  })
  provider?: InternalAssetMaintenanceProviderDocument | null;

  @Prop({
    type: InternalAssetExpirationStatusMaterializationDocument,
    required: false,
    default: null,
  })
  expiration_status_materialization?: InternalAssetExpirationStatusMaterializationDocument | null;

  @Prop({
    type: InternalAssetExpirationNotificationMaterializationDocument,
    required: false,
    default: null,
  })
  expiration_notification_materialization?: InternalAssetExpirationNotificationMaterializationDocument | null;

  @Prop({ type: String, required: false, default: null, index: true })
  created_by?: string | null;

  @Prop({ type: String, required: false, default: null })
  updated_by?: string | null;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const InternalAssetMaintenanceRecordSchema =
  SchemaFactory.createForClass(InternalAssetMaintenanceRecordDocument);
