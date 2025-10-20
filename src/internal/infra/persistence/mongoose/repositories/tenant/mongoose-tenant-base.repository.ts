import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Tenant } from '@domain/entities';
import {
  TenantAppearanceConfigDocument,
  TenantConfigsDocument,
  TenantDocument,
  TenantThemeConfigDocument,
} from '@infra/persistence/mongoose/schemas';
import * as mappers from '@infra/persistence/mongoose/mappers';
import {
  TenantAggregateDocuments,
  TenantMongooseAggregate,
} from '@infra/persistence/mongoose/mappers/tenant';

@Injectable()
export class MongooseTenantBaseRepository {
  constructor(
    @InjectModel(TenantDocument.name)
    protected readonly tenantModel: Model<TenantDocument>,
    @InjectModel(TenantConfigsDocument.name)
    protected readonly tenantConfigsModel: Model<TenantConfigsDocument>,
    @InjectModel(TenantThemeConfigDocument.name)
    protected readonly tenantThemeModel: Model<TenantThemeConfigDocument>,
    @InjectModel(TenantAppearanceConfigDocument.name)
    protected readonly tenantAppearanceModel: Model<TenantAppearanceConfigDocument>,
  ) {}

  protected toDomain(docs: TenantAggregateDocuments): Tenant | null {
    return mappers.MongooseTenantMapper.toDomain(docs);
  }

  protected toMongoose(tenant: Tenant): TenantMongooseAggregate {
    return mappers.MongooseTenantMapper.toMongoose(tenant);
  }
}
