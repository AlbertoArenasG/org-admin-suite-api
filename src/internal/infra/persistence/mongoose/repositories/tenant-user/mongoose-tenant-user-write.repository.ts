import { Injectable } from '@nestjs/common';

import { TenantUser } from '@domain/entities';
import { ITenantUserWriteRepository } from '@domain/ports/repositories';

import { MongooseTenantUserBaseRepository } from './mongoose-tenant-user-base.repository';

@Injectable()
export class MongooseTenantUserWriteRepositoryImpl
  extends MongooseTenantUserBaseRepository
  implements ITenantUserWriteRepository
{
  async create(tenantUser: TenantUser): Promise<{ data: TenantUser | null }> {
    const data = this.toMongoose(tenantUser);
    const entity = new this.tenantUserModel(data);
    await entity.save();

    return {
      data: this.toDomain(entity),
    };
  }
}
