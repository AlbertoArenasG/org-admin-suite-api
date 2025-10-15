import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { UserRole, UserStatus } from '@domain/entities/user.entity';
import { genId } from '@src/common/utils';

@Schema({
  collection: 'users',
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class UserDocument extends Document {
  @Prop({
    type: String,
    default: genId,
    immutable: true,
    unique: true,
    index: true,
  })
  user_id: string;

  @Prop()
  name: string;

  @Prop()
  lastname: string;

  @Prop()
  full_name: string;

  @Prop({ unique: true, index: true })
  email: string;

  @Prop()
  password: string;

  @Prop({ type: String, enum: Object.values(UserRole), index: true })
  role: UserRole;

  @Prop({ type: String, enum: Object.values(UserStatus), index: true })
  status: UserStatus;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

const UserSchema = SchemaFactory.createForClass(UserDocument);

export { UserSchema };
