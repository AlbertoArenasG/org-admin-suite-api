import { Injectable } from '@nestjs/common';

import {
  CreateUserPasswordResetTokenRecord,
  IUserPasswordResetTokenWriteRepository,
} from '@domain/ports/repositories';
import { MongooseUserPasswordResetTokenBaseRepository } from './mongoose-user-password-reset-token-base.repository';

@Injectable()
export class MongooseUserPasswordResetTokenWriteRepositoryImpl
  extends MongooseUserPasswordResetTokenBaseRepository
  implements IUserPasswordResetTokenWriteRepository
{
  async create(record: CreateUserPasswordResetTokenRecord) {
    const data = this.toMongoose(record);
    const entity = new this.tokenModel(data);
    await entity.save();

    return {
      data: this.toDomain(entity),
    };
  }

  async markAsConsumed(passwordResetTokenId: string, consumedAt: Date) {
    const updated = await this.tokenModel
      .findOneAndUpdate(
        { password_reset_token_id: passwordResetTokenId },
        { consumed_at: consumedAt },
        { new: true },
      )
      .exec();

    return {
      data: this.toDomain(updated),
    };
  }

  async invalidateAllForUser(userId: string) {
    await this.tokenModel
      .updateMany(
        { user_id: userId, consumed_at: { $eq: null } },
        { consumed_at: new Date() },
      )
      .exec();
  }
}
