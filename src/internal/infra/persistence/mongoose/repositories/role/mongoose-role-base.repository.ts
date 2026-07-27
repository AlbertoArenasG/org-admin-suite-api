import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Role } from '@domain/entities';
import { MongooseRoleMapper } from '@infra/persistence/mongoose/mappers';
import { RoleDocument } from '@infra/persistence/mongoose/schemas';

@Injectable()
export class MongooseRoleBaseRepository {
  constructor(
    @InjectModel(RoleDocument.name)
    protected readonly roleModel: Model<RoleDocument>,
  ) {}

  protected toDomain(document: RoleDocument | null): Role | null {
    return MongooseRoleMapper.toDomain(document);
  }

  protected toMongoose(role: Role) {
    return MongooseRoleMapper.toMongoose(role);
  }
}
