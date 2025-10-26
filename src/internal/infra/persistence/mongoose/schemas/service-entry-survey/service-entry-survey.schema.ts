import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

import { ServiceEntrySurveyQuestionType } from '@domain/entities';
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

  @Prop({ type: String, required: true })
  template_id: string;

  @Prop({ type: Number, required: true })
  template_version: number;

  @Prop({
    type: [
      {
        question_id: { type: String, required: true },
        value: { type: MongooseSchema.Types.Mixed, default: null },
        type: {
          type: String,
          enum: Object.values(ServiceEntrySurveyQuestionType),
          required: true,
        },
      },
    ],
    required: true,
    default: [],
  })
  answers: Array<{
    question_id: string;
    value: string | number | boolean | null;
    type: ServiceEntrySurveyQuestionType;
  }>;

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
