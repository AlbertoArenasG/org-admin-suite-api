import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { genId } from '@src/common/utils';
import { ServicePackageRecordStatus } from '@domain/entities';

export interface IServicePackageRecordFileSchema {
  file_id: string;
  relative_path: string;
  original_name: string;
  s3_key: string;
  size: number;
  content_type: string;
}

@Schema({
  collection: 'service_package_records',
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class ServicePackageRecordDocument extends Document {
  @Prop({
    type: String,
    default: () => genId(),
    unique: true,
    immutable: true,
    index: true,
  })
  service_package_record_id: string;

  @Prop({ type: String, required: true, index: true })
  package_id: string;

  @Prop({ type: String, required: true, index: true })
  service_order: string;

  @Prop({ type: String, default: null })
  original_filename?: string | null;

  @Prop({ type: String, required: true })
  s3_folder_key: string;

  @Prop({ type: Object, required: true })
  details: Record<string, unknown>;

  @Prop({ type: String, default: null })
  company?: string | null;

  @Prop({ type: String, default: null })
  collector_name?: string | null;

  @Prop({ type: String, default: null })
  contact_person?: string | null;

  @Prop({ type: String, default: null })
  email?: string | null;

  @Prop({ type: String, default: null })
  phone?: string | null;

  @Prop({ type: String, default: null })
  address?: string | null;

  @Prop({ type: String, default: null })
  visit_date?: string | null;

  @Prop({ type: String, default: null })
  service_type?: string | null;

  @Prop({ type: String, default: null })
  purpose?: string | null;

  @Prop({
    type: [
      {
        file_id: { type: String, required: true },
        relative_path: { type: String, required: true },
        original_name: { type: String, required: true },
        s3_key: { type: String, required: true },
        size: { type: Number, required: true },
        content_type: { type: String, required: true },
      },
    ],
    default: [],
  })
  files: IServicePackageRecordFileSchema[];

  @Prop({
    type: String,
    enum: Object.values(ServicePackageRecordStatus),
    default: ServicePackageRecordStatus.ACTIVE,
    index: true,
  })
  status?: ServicePackageRecordStatus;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const ServicePackageRecordSchema = SchemaFactory.createForClass(
  ServicePackageRecordDocument,
);
