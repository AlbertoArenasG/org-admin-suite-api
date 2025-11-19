import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  CreateUserPasswordResetTokenRecord,
  UserPasswordResetTokenRecord,
} from '@domain/ports/repositories';
import { UserPasswordResetTokenDocument } from '@infra/persistence/mongoose/schemas';
import { MongooseUserPasswordResetTokenMapper } from '@infra/persistence/mongoose/mappers';

@Injectable()
export class MongooseUserPasswordResetTokenBaseRepository {
  constructor(
    @InjectModel(UserPasswordResetTokenDocument.name)
    protected readonly tokenModel: Model<UserPasswordResetTokenDocument>,
  ) {}

  protected toDomain(
    document: UserPasswordResetTokenDocument | null,
  ): UserPasswordResetTokenRecord | null {
    return MongooseUserPasswordResetTokenMapper.toDomain(document);
  }

  protected toMongoose(record: CreateUserPasswordResetTokenRecord) {
    return MongooseUserPasswordResetTokenMapper.toMongoose(record);
  }
}
