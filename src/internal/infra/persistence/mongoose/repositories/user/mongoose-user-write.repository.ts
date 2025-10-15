import { Injectable } from '@nestjs/common';

import { User } from '@domain/entities/user.entity';
import { IUserWriteRepository } from '@src/internal/domain/ports/repositories';
import { MongooseUserBaseRepository } from './mongoose-user-base.repository';

@Injectable()
export class MongooseUserWriteRepositoryImpl
  extends MongooseUserBaseRepository
  implements IUserWriteRepository
{
  async create(user: User): Promise<{ data: User }> {
    const data = this.toMongoose(user);
    const entity = new this.userModel(data);
    await entity.save();
    return {
      data: this.toDomain(entity),
    };
  }
}
