import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  collection: 'internal_job_locks',
  timestamps: false,
})
export class InternalJobLockDocument extends Document {
  @Prop({ type: String, required: true, unique: true, index: true })
  job_name: string;

  @Prop({ type: String, required: true })
  execution_id: string;

  @Prop({ type: Date, required: true, index: true })
  locked_until: Date;
}

export const InternalJobLockSchema = SchemaFactory.createForClass(
  InternalJobLockDocument,
);
