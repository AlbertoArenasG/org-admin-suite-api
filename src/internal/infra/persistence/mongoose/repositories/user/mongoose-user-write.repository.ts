import { Injectable } from '@nestjs/common';

import { User } from '@domain/entities/user.entity';
import { IUserWriteRepository } from '@src/internal/domain/ports/repositories';
import { MongooseUserBaseRepository } from './mongoose-user-base.repository';

@Injectable()
export class MongooseUserWriteRepositoryImpl
  extends MongooseUserBaseRepository
  implements IUserWriteRepository
{
  async create(user: User): Promise<{ data: User | null }> {
    const data = this.toMongoose(user);
    const entity = new this.userModel(data);
    await entity.save({ session: this.transactionContext.getSession() });
    return {
      data: this.toDomain(entity),
    };
  }

  async update(user: User): Promise<{ data: User | null }> {
    const data = this.toMongoose(user);

    const updated = await this.userModel
      .findOneAndUpdate({ user_id: user.id }, data, { new: true })
      .session(this.transactionContext.getSession() ?? null)
      .exec();

    return {
      data: updated ? this.toDomain(updated) : null,
    };
  }
}
