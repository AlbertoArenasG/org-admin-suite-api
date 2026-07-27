import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { SystemRole } from '@domain/entities';
import { UserRole, UserStatus } from '@domain/entities/user.entity';
import { PhoneSchema, IPhoneSchema } from '../shared';
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
    default: () => genId(),
    immutable: true,
    unique: true,
    index: true,
  })
  user_id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  lastname: string;

  @Prop({ required: true })
  full_name: string;

  @Prop({ unique: true, index: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({
    type: String,
    enum: Object.values(UserRole),
    required: true,
    index: true,
  })
  role: UserRole;

  @Prop({
    type: String,
    enum: Object.values(SystemRole),
    required: false,
    index: true,
  })
  system_role?: SystemRole;

  @Prop({ type: String, required: false, default: null, index: true })
  role_id?: string | null;

  @Prop({
    type: String,
    enum: Object.values(UserStatus),
    required: true,
    index: true,
  })
  status: UserStatus;

  @Prop({
    type: PhoneSchema,
    required: false,
    default: { country_code: null, number: null },
  })
  cell_phone?: IPhoneSchema;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

const UserSchema = SchemaFactory.createForClass(UserDocument);

export { UserSchema };
