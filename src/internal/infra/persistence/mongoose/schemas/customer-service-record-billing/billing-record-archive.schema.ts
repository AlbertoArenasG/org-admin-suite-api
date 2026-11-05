import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ collection: 'billing_record_archives', versionKey: false })
export class BillingRecordArchiveDocument extends Document {
  @Prop({ type: String, required: true, unique: true }) archive_id: string;
  @Prop({ type: String, required: true }) record_id: string;
  @Prop({ type: Number, required: true }) invoice_revision: number;
  @Prop({ type: MongooseSchema.Types.Mixed, required: true }) invoice: Record<
    string,
    unknown
  >;
  @Prop({ type: MongooseSchema.Types.Mixed, required: true }) billing: Record<
    string,
    unknown
  >;
  @Prop({ type: Date, required: true }) archived_at: Date;
  @Prop({ type: String, required: true }) archived_by: string;
}

export const BillingRecordArchiveSchema = SchemaFactory.createForClass(
  BillingRecordArchiveDocument,
);
BillingRecordArchiveSchema.index(
  { record_id: 1, invoice_revision: 1 },
  { unique: true },
);
BillingRecordArchiveSchema.index({
  record_id: 1,
  archived_at: -1,
  archive_id: -1,
});
