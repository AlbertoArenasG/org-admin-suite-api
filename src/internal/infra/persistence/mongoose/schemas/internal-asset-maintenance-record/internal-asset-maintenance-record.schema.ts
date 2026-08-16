import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import {
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
