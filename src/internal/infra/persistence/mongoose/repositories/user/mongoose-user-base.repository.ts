import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { User } from '@domain/entities/user.entity';
import { UserDocument } from '@infra/persistence/mongoose/schemas';

import * as mappers from '@infra/persistence/mongoose/mappers';

@Injectable()
export class MongooseUserBaseRepository {
  constructor(
    @InjectModel(UserDocument.name)
    protected readonly userModel: Model<UserDocument>,
  ) {}

  protected toDomain(userDocument: UserDocument): User {
    return mappers.MongooseUserMapper.toDomain(userDocument);
  }

  protected toMongoose(user: User) {
    return mappers.MongooseUserMapper.toMongoose(user);
  }
}
