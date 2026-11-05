import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BillingRecordCommentVisibility } from '@domain/entities';

@Schema({ collection: 'billing_record_comments', versionKey: false })
export class BillingRecordCommentDocument extends Document {
  @Prop({ type: String, required: true, unique: true }) comment_id: string;
  @Prop({ type: String, required: true }) record_id: string;
  @Prop({ type: String, required: true }) text: string;
  @Prop({
    type: String,
    enum: Object.values(BillingRecordCommentVisibility),
    required: true,
  })
  visibility: BillingRecordCommentVisibility;
  @Prop({ type: Date, required: true }) created_at: Date;
  @Prop({ type: Date, required: true }) updated_at: Date;
  @Prop({ type: String, required: true }) created_by: string;
  @Prop({ type: String, required: true }) updated_by: string;
}
export const BillingRecordCommentSchema = SchemaFactory.createForClass(
  BillingRecordCommentDocument,
);
BillingRecordCommentSchema.index({
  record_id: 1,
  created_at: -1,
  comment_id: -1,
});
