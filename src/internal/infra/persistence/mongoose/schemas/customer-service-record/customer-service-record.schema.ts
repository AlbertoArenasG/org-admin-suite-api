import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import {
  CustomerServiceRecordMaterializationSource,
  CustomerServiceRecordNotificationTriggerEventStatus,
  CustomerServiceRecordOperationalStatus,
  CustomerServiceRecordProviderFollowUpEventStatus,
  CustomerServiceRecordStatus,
} from '@domain/entities';

@Schema({ _id: false })
export class CustomerServiceRecordIntervalDocument {
  @Prop({ type: Number, default: 0 }) years: number;
  @Prop({ type: Number, default: 0 }) months: number;
  @Prop({ type: Number, default: 0 }) weeks: number;
  @Prop({ type: Number, default: 0 }) days: number;
}

@Schema({ _id: false })
export class CustomerServiceRecordCustomerUserDocument {
  @Prop({ type: String, required: true }) user_id: string;
  @Prop({ type: String, required: true }) name: string;
  @Prop({ type: String, required: true }) email: string;
}

@Schema({ _id: false })
export class CustomerServiceRecordCustomerDocument {
  @Prop({ type: String, required: true }) customer_id: string;
  @Prop({ type: String, required: true }) customer_name: string;
  @Prop({
    type: [CustomerServiceRecordCustomerUserDocument],
    required: true,
    default: [],
  })
  users: CustomerServiceRecordCustomerUserDocument[];
}

@Schema({ _id: false })
export class CustomerServiceRecordAssetDocument {
  @Prop({ type: String, required: true }) asset_id: string;
  @Prop({ type: String, required: true }) name: string;
  @Prop({ type: String, required: true }) identifier: string;
  @Prop({ type: String, required: true }) brand: string;
  @Prop({ type: String, required: true }) model: string;
  @Prop({ type: String, required: true }) serial_number: string;
  @Prop({ type: String, required: false, default: null }) observations?:
    | string
    | null;
}

@Schema({ _id: false })
export class CustomerServiceRecordMatchedRuleDocument {
  @Prop({ type: String, required: true }) source_rule_id: string;
  @Prop({
    type: CustomerServiceRecordIntervalDocument,
    required: true,
    default: {},
  })
  start_offset: CustomerServiceRecordIntervalDocument;
}

@Schema({ _id: false })
export class CustomerServiceRecordStatusMaterializationDocument {
  @Prop({
    type: String,
    enum: Object.values(CustomerServiceRecordMaterializationSource),
    required: true,
  })
  source: CustomerServiceRecordMaterializationSource;
  @Prop({ type: String, required: true }) code: string;
  @Prop({ type: String, required: false, default: null })
  effective_start_date?: string | null;
  @Prop({ type: String, required: true }) label: string;
  @Prop({ type: String, required: false, default: null }) label_key?:
    | string
    | null;
  @Prop({ type: String, required: true }) color_hex: string;
  @Prop({
    type: CustomerServiceRecordMatchedRuleDocument,
    required: false,
    default: null,
  })
  matched_rule?: CustomerServiceRecordMatchedRuleDocument | null;
  @Prop({ type: Date, required: true }) last_materialized_at: Date;
}

@Schema({ _id: false })
export class CustomerServiceRecordNotificationTriggerEventDocument {
  @Prop({ type: String, required: true }) trigger_date: string;
  @Prop({
    type: String,
    enum: Object.values(CustomerServiceRecordNotificationTriggerEventStatus),
    required: true,
  })
  status: CustomerServiceRecordNotificationTriggerEventStatus;
  @Prop({ type: Date, required: false, default: null })
  triggered_at?: Date | null;
  @Prop({ type: String, required: false, default: null }) failure_reason?:
    | string
    | null;
}

@Schema({ _id: false })
export class CustomerServiceRecordNotificationMaterializedRuleDocument {
  @Prop({ type: String, required: true }) source_rule_id: string;
  @Prop({ type: String, required: true }) anchor: string;
  @Prop({
    type: CustomerServiceRecordIntervalDocument,
    required: true,
    default: {},
  })
  start_offset: CustomerServiceRecordIntervalDocument;
  @Prop({ type: String, required: true }) trigger_mode: string;
  @Prop({
    type: CustomerServiceRecordIntervalDocument,
    required: false,
    default: null,
  })
  repeat_every?: CustomerServiceRecordIntervalDocument | null;
  @Prop({ type: String, required: false, default: null }) repeat_until?:
    | string
    | null;
  @Prop({
    type: CustomerServiceRecordIntervalDocument,
    required: false,
    default: null,
  })
  repeat_for?: CustomerServiceRecordIntervalDocument | null;
  @Prop({
    type: [CustomerServiceRecordNotificationTriggerEventDocument],
    required: true,
    default: [],
  })
  trigger_events: CustomerServiceRecordNotificationTriggerEventDocument[];
  @Prop({ type: Date, required: false, default: null })
  last_triggered_at?: Date | null;
}

@Schema({ _id: false })
export class CustomerServiceRecordNotificationMaterializationDocument {
  @Prop({
    type: String,
    enum: Object.values(CustomerServiceRecordMaterializationSource),
    required: true,
  })
  source: CustomerServiceRecordMaterializationSource;
  @Prop({ type: String, required: false, default: null }) next_trigger_date?:
    | string
    | null;
  @Prop({ type: Date, required: false, default: null })
  last_triggered_at?: Date | null;
  @Prop({ type: Number, required: true, default: 0 })
  materialized_rules_count: number;
  @Prop({
    type: [CustomerServiceRecordNotificationMaterializedRuleDocument],
    required: true,
    default: [],
  })
  materialized_rules: CustomerServiceRecordNotificationMaterializedRuleDocument[];
  @Prop({ type: Date, required: true }) last_materialized_at: Date;
}

@Schema({ _id: false })
export class CustomerServiceRecordProviderFollowUpRuleDocument {
  @Prop({ type: String, required: true }) rule_id: string;
  @Prop({
    type: CustomerServiceRecordIntervalDocument,
    required: true,
    default: {},
  })
  interval: CustomerServiceRecordIntervalDocument;
  @Prop({ type: [String], required: true, default: [] })
  recipient_group_ids: string[];
  @Prop({ type: [String], required: true, default: [] })
  cc_recipient_group_ids: string[];
}

@Schema({ _id: false })
export class CustomerServiceRecordProviderFollowUpDocument {
  @Prop({ type: Boolean, required: true, default: false }) enabled: boolean;
  @Prop({
    type: [CustomerServiceRecordProviderFollowUpRuleDocument],
    required: true,
    default: [],
  })
  rules: CustomerServiceRecordProviderFollowUpRuleDocument[];
}

@Schema({ _id: false })
export class CustomerServiceRecordProviderFollowUpMaterializationDocument {
  @Prop({ type: String, required: true, default: 'EMBEDDED_RULE' })
  source: 'EMBEDDED_RULE';
  @Prop({ type: String, required: true }) source_rule_id: string;
  @Prop({ type: String, required: true }) trigger_date: string;
  @Prop({
    type: String,
    enum: Object.values(CustomerServiceRecordProviderFollowUpEventStatus),
    required: true,
  })
  status: CustomerServiceRecordProviderFollowUpEventStatus;
  @Prop({ type: Date, required: false, default: null })
  triggered_at?: Date | null;
  @Prop({ type: String, required: false, default: null }) failure_reason?:
    | string
    | null;
  @Prop({ type: Date, required: true }) last_materialized_at: Date;
}

@Schema({ _id: false })
export class CustomerServiceRecordCustomerDeliveryDocument {
  @Prop({ type: String, required: false, default: null }) received_at?:
    | string
    | null;
  @Prop({
    type: CustomerServiceRecordIntervalDocument,
    required: true,
    default: {},
  })
  estimated_delivery_interval: CustomerServiceRecordIntervalDocument;
  @Prop({ type: String, required: false, default: null, index: true })
  estimated_delivery_at?: string | null;
  @Prop({ type: String, required: false, default: null })
  delivered_to_customer_at?: string | null;
  @Prop({ type: String, required: false, default: null }) status_policy_id?:
    | string
    | null;
  @Prop({ type: String, required: false, default: null })
  notification_policy_id?: string | null;
  @Prop({
    type: CustomerServiceRecordStatusMaterializationDocument,
    required: false,
    default: null,
  })
  status_materialization?: CustomerServiceRecordStatusMaterializationDocument | null;
  @Prop({
    type: CustomerServiceRecordNotificationMaterializationDocument,
    required: false,
    default: null,
  })
  notification_materialization?: CustomerServiceRecordNotificationMaterializationDocument | null;
}

@Schema({ _id: false })
export class CustomerServiceRecordProviderDocument {
  @Prop({ type: String, required: true }) provider_id: string;
  @Prop({ type: String, required: true }) provider_name: string;
  @Prop({ type: String, required: false, default: null })
  delivered_to_provider_at?: string | null;
  @Prop({
    type: CustomerServiceRecordIntervalDocument,
    required: true,
    default: {},
  })
  estimated_return_interval: CustomerServiceRecordIntervalDocument;
  @Prop({ type: String, required: false, default: null, index: true })
  estimated_return_at?: string | null;
  @Prop({ type: String, required: false, default: null })
  returned_from_provider_at?: string | null;
  @Prop({ type: String, required: false, default: null }) status_policy_id?:
    | string
    | null;
  @Prop({ type: String, required: false, default: null })
  notification_policy_id?: string | null;
  @Prop({
    type: CustomerServiceRecordProviderFollowUpDocument,
    required: true,
    default: {},
  })
  follow_up: CustomerServiceRecordProviderFollowUpDocument;
  @Prop({
    type: CustomerServiceRecordStatusMaterializationDocument,
    required: false,
    default: null,
  })
  status_materialization?: CustomerServiceRecordStatusMaterializationDocument | null;
  @Prop({
    type: CustomerServiceRecordNotificationMaterializationDocument,
    required: false,
    default: null,
  })
  notification_materialization?: CustomerServiceRecordNotificationMaterializationDocument | null;
  @Prop({
    type: [CustomerServiceRecordProviderFollowUpMaterializationDocument],
    required: true,
    default: [],
  })
  follow_up_materialization: CustomerServiceRecordProviderFollowUpMaterializationDocument[];
}

@Schema({
  collection: 'customer_service_records',
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class CustomerServiceRecordDocument extends Document {
  @Prop({
    type: String,
    required: true,
    immutable: true,
    unique: true,
    index: true,
  })
  customer_service_record_id: string;
  @Prop({
    type: Number,
    required: true,
    immutable: true,
    unique: true,
    index: true,
  })
  service_number: number;
  @Prop({ type: String, required: true, index: true })
  service_type_code: string;
  @Prop({ type: String, required: true }) service_type_name: string;
  @Prop({ type: String, required: true, index: true }) requested_at: string;
  @Prop({ type: String, required: false, default: null }) observations?:
    | string
    | null;
  @Prop({ type: CustomerServiceRecordCustomerDocument, required: true })
  customer: CustomerServiceRecordCustomerDocument;
  @Prop({
    type: [CustomerServiceRecordAssetDocument],
    required: true,
    default: [],
  })
  assets: CustomerServiceRecordAssetDocument[];
  @Prop({ type: CustomerServiceRecordCustomerDeliveryDocument, required: true })
  customer_delivery: CustomerServiceRecordCustomerDeliveryDocument;
  @Prop({
    type: CustomerServiceRecordProviderDocument,
    required: false,
    default: null,
  })
  provider?: CustomerServiceRecordProviderDocument | null;
  @Prop({
    type: String,
    enum: Object.values(CustomerServiceRecordStatus),
    required: true,
    default: CustomerServiceRecordStatus.ACTIVE,
    index: true,
  })
  status: CustomerServiceRecordStatus;
  @Prop({
    type: String,
    enum: Object.values(CustomerServiceRecordOperationalStatus),
    required: true,
    default: CustomerServiceRecordOperationalStatus.PENDING,
    index: true,
  })
  operational_status: CustomerServiceRecordOperationalStatus;
  @Prop({ type: String, required: false, default: null, index: true })
  created_by?: string | null;
  @Prop({ type: String, required: false, default: null }) updated_by?:
    | string
    | null;
  @Prop() createdAt?: Date;
  @Prop() updatedAt?: Date;
}

export const CustomerServiceRecordSchema = SchemaFactory.createForClass(
  CustomerServiceRecordDocument,
);
CustomerServiceRecordSchema.index({
  status: 1,
  createdAt: -1,
  customer_service_record_id: 1,
});
CustomerServiceRecordSchema.index({
  status: 1,
  operational_status: 1,
  createdAt: -1,
});
CustomerServiceRecordSchema.index({
  status: 1,
  service_type_code: 1,
  createdAt: -1,
});
CustomerServiceRecordSchema.index({
  status: 1,
  'customer.customer_id': 1,
  createdAt: -1,
});
CustomerServiceRecordSchema.index({
  status: 1,
  'customer.users.user_id': 1,
  createdAt: -1,
});
CustomerServiceRecordSchema.index({
  status: 1,
  'provider.provider_id': 1,
  createdAt: -1,
});
CustomerServiceRecordSchema.index({
  status: 1,
  'customer_delivery.estimated_delivery_at': 1,
});
CustomerServiceRecordSchema.index({
  status: 1,
  'provider.estimated_return_at': 1,
});
