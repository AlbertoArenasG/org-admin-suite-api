import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import {
  UserRegistrationInvitationScope,
  UserRegistrationInvitationStatus,
  UserRegistrationInvitationType,
} from '@domain/ports/repositories';
import { SystemRole } from '@domain/entities';
import { IPhoneSchema, PhoneSchema } from '../shared';
import { genId } from '@src/common/utils';

@Schema({
  collection: 'user_registration_invitations',
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class UserRegistrationInvitationDocument extends Document {
  @Prop({
    type: String,
    default: () => genId(),
    immutable: true,
    unique: true,
    index: true,
  })
  invitation_id: string;

  @Prop({
    type: String,
    enum: Object.values(UserRegistrationInvitationScope),
    required: true,
    index: true,
  })
  scope: UserRegistrationInvitationScope;

  @Prop({
    type: String,
    enum: Object.values(UserRegistrationInvitationType),
    required: true,
    index: true,
    default: UserRegistrationInvitationType.NEW_USER_REGISTRATION,
  })
  type: UserRegistrationInvitationType;

  @Prop({
    type: String,
    enum: Object.values(UserRegistrationInvitationStatus),
    required: true,
    index: true,
    default: UserRegistrationInvitationStatus.PENDING,
  })
  status: UserRegistrationInvitationStatus;

  @Prop({ type: String, required: true, index: true })
  email: string;

  @Prop({
    type: String,
    enum: Object.values(SystemRole),
    required: true,
    index: true,
  })
  system_role: SystemRole;

  @Prop({ type: String, required: false, default: null, index: true })
  role_id: string | null;

  @Prop({ type: String, required: true, index: true })
  invited_by_user_id: string;

  @Prop({ type: String, required: true, unique: true })
  token_hash: string;

  @Prop({
    _id: false,
    type: {
      name: { type: String, default: null },
      lastname: { type: String, default: null },
      cell_phone: { type: PhoneSchema, default: null },
      additional: { type: Object, default: {} },
    },
    default: {},
  })
  user_data?: {
    name?: string | null;
    lastname?: string | null;
    cell_phone?: IPhoneSchema | null;
    additional?: Record<string, unknown>;
  };

  @Prop({ type: Date, default: null })
  consumed_at?: Date | null;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

const UserRegistrationInvitationSchema = SchemaFactory.createForClass(
  UserRegistrationInvitationDocument,
);

export { UserRegistrationInvitationSchema };
