import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { ServiceEntrySurveyQuestionType } from '@domain/entities';

@Schema({
  collection: 'service_entry_survey_templates',
  timestamps: true,
})
export class ServiceEntrySurveyTemplateDocument extends Document {
  @Prop({ type: String, required: true, unique: true })
  template_id: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: Number, required: true })
  version: number;

  @Prop({ type: String, required: false, default: null })
  category: string | null;

  @Prop({ type: Boolean, default: false })
  is_default: boolean;

  @Prop({
    type: [
      {
        question_id: { type: String, required: true },
        text: { type: String, required: true },
        type: {
          type: String,
          enum: Object.values(ServiceEntrySurveyQuestionType),
          required: true,
        },
        required: { type: Boolean, default: true },
        options: { type: [String], default: [] },
        weight: { type: Number, default: 1 },
      },
    ],
    required: true,
    default: [],
  })
  questions: Array<{
    question_id: string;
    text: string;
    type: ServiceEntrySurveyQuestionType;
    required: boolean;
    options?: string[];
    weight?: number;
  }>;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

const ServiceEntrySurveyTemplateSchema = SchemaFactory.createForClass(
  ServiceEntrySurveyTemplateDocument,
);

export { ServiceEntrySurveyTemplateSchema };
