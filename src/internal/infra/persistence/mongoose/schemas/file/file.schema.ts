import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { genId } from '@src/common/utils';

@Schema({
  collection: 'files',
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class FileDocument extends Document {
  @Prop({
    type: String,
    default: () => genId(),
    immutable: true,
    unique: true,
    index: true,
  })
  file_id: string;

  @Prop({ required: true })
  original_name: string;

  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  mime_type: string;

  @Prop({ required: true })
  size: number;

  @Prop({ required: true })
  storage_key: string;

  @Prop({ required: true })
  bucket: string;

  @Prop({ required: false, default: null })
  url?: string | null;

  @Prop({ required: false, default: null })
  uploaded_by?: string | null;

  @Prop({ type: Object, required: false, default: {} })
  metadata?: Record<string, unknown>;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

const FileSchema = SchemaFactory.createForClass(FileDocument);

export { FileSchema };
