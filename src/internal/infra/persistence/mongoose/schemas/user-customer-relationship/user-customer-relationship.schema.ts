import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { genId } from '@src/common/utils';

@Schema({
  collection: 'users_customers',
  timestamps: false,
})
export class UserCustomerRelationshipDocument extends Document {
  @Prop({
    type: String,
    default: () => genId(),
    immutable: true,
    unique: true,
    index: true,
  })
  user_customer_relationship_id: string;

  @Prop({ type: String, required: true, index: true })
  user_id: string;

  @Prop({ type: String, required: true, index: true })
  customer_id: string;
}

export const UserCustomerRelationshipSchema = SchemaFactory.createForClass(
  UserCustomerRelationshipDocument,
);

UserCustomerRelationshipSchema.index(
  { user_id: 1, customer_id: 1 },
  { unique: true },
);
UserCustomerRelationshipSchema.index({ customer_id: 1, user_id: 1 });
