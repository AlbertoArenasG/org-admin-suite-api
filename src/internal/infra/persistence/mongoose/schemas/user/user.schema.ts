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
  @Prop({ type: String, default: genId })
  _id: string;

  @Prop()
  name: string;

  @Prop()
  lastname: string;

  @Prop()
  full_name: string;

  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop({ type: UserRole, enum: Object.values(UserRole) })
  role: UserRole;

  @Prop({ type: UserStatus, enum: Object.values(UserStatus) })
  status: string;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

const UserSchema = SchemaFactory.createForClass(UserDocument);

UserSchema.index({
  name: 1,
  lastname: 1,
  full_name: 1,
  email: 1,
  role: 1,
  status: 1,
});

export { UserSchema };
