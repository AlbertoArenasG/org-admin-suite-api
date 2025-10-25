import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { ServiceEntrySurveyRating } from '@domain/entities';
import { genId } from '@src/common/utils';

@Schema({
  collection: 'service_entry_surveys',
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class ServiceEntrySurveyDocument extends Document {
  @Prop({
    type: String,
    default: () => genId(),
    immutable: true,
    unique: true,
    index: true,
  })
  service_entry_survey_id: string;

  @Prop({ type: String, required: true, index: true })
  service_entry_id: string;

  @Prop({ type: String, required: true, index: true })
  access_id: string;

  @Prop({ type: String, required: true, unique: true })
  token_hash: string;

  @Prop({
    type: String,
    enum: Object.values(ServiceEntrySurveyRating),
    required: true,
  })
  staff_treatment: ServiceEntrySurveyRating;

  @Prop({
    type: String,
    enum: Object.values(ServiceEntrySurveyRating),
    required: true,
  })
  response_time: ServiceEntrySurveyRating;

  @Prop({
    type: String,
    enum: Object.values(ServiceEntrySurveyRating),
    required: true,
  })
  appearance_attitude: ServiceEntrySurveyRating;

  @Prop({
    type: String,
    enum: Object.values(ServiceEntrySurveyRating),
    required: true,
  })
  documentation_delivery: ServiceEntrySurveyRating;

  @Prop({ type: String, default: null })
  observations?: string | null;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

const ServiceEntrySurveySchema = SchemaFactory.createForClass(
  ServiceEntrySurveyDocument,
);

export { ServiceEntrySurveySchema };
