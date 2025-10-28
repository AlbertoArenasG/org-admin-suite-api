import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { genId } from '@src/common/utils';

@Schema({
  collection: 'user_password_reset_tokens',
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class UserPasswordResetTokenDocument extends Document {
  @Prop({
    type: String,
    default: () => genId(),
    immutable: true,
    unique: true,
    index: true,
  })
  password_reset_token_id: string;

  @Prop({ type: String, required: true, index: true })
  user_id: string;

  @Prop({ type: String, required: true, index: true })
  email: string;

  @Prop({ type: String, required: true, unique: true })
  token_hash: string;

  @Prop({ type: Date, required: true })
  requested_at: Date;

  @Prop({ type: Date, required: true, index: true })
  expires_at: Date;

  @Prop({ type: Date, default: null })
  consumed_at?: Date | null;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

const UserPasswordResetTokenSchema = SchemaFactory.createForClass(
  UserPasswordResetTokenDocument,
);

export { UserPasswordResetTokenSchema };
