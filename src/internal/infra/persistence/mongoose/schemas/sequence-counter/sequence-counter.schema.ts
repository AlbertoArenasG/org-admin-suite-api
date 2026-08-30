import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'internal_sequence_counters', timestamps: false })
export class SequenceCounterDocument extends Document {
  @Prop({ type: String, required: true, unique: true, index: true })
  key: string;
  @Prop({ type: Number, required: true, default: 0 }) current_value: number;
}

export const SequenceCounterSchema = SchemaFactory.createForClass(
  SequenceCounterDocument,
);
