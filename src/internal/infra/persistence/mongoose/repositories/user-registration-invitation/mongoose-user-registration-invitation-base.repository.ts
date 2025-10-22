import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import {
  CreateUserRegistrationInvitationRecord,
  UserRegistrationInvitationRecord,
} from '@domain/ports/repositories';
import { UserRegistrationInvitationDocument } from '@infra/persistence/mongoose/schemas';
import { MongooseUserRegistrationInvitationMapper } from '@infra/persistence/mongoose/mappers';

@Injectable()
export class MongooseUserRegistrationInvitationBaseRepository {
  constructor(
    @InjectModel(UserRegistrationInvitationDocument.name)
    protected readonly invitationModel: Model<UserRegistrationInvitationDocument>,
  ) {}

  protected toDomain(
    document: UserRegistrationInvitationDocument | null,
  ): UserRegistrationInvitationRecord | null {
    return MongooseUserRegistrationInvitationMapper.toDomain(document);
  }

  protected toMongoose(record: CreateUserRegistrationInvitationRecord) {
    return MongooseUserRegistrationInvitationMapper.toMongoose(record);
  }
}
