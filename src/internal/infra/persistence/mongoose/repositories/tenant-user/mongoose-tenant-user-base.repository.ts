import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { TenantUser } from '@domain/entities';
import { TenantUserDocument } from '@infra/persistence/mongoose/schemas';
import * as mappers from '@infra/persistence/mongoose/mappers';

@Injectable()
export class MongooseTenantUserBaseRepository {
  constructor(
    @InjectModel(TenantUserDocument.name)
    protected readonly tenantUserModel: Model<TenantUserDocument>,
  ) {}

  protected toDomain(document: TenantUserDocument): TenantUser | null {
    return mappers.MongooseTenantUserMapper.toDomain(document);
  }

  protected toMongoose(tenantUser: TenantUser) {
    return mappers.MongooseTenantUserMapper.toMongoose(tenantUser);
  }
}
