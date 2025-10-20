import { Injectable } from '@nestjs/common';

import { TenantUser } from '@domain/entities';
import { ITenantUserReadRepository } from '@domain/ports/repositories';

import { MongooseTenantUserBaseRepository } from './mongoose-tenant-user-base.repository';

@Injectable()
export class MongooseTenantUserReadRepositoryImpl
  extends MongooseTenantUserBaseRepository
  implements ITenantUserReadRepository
{
  async findManyByUserId(userId: string): Promise<{ data: TenantUser[] }> {
    const documents = await this.tenantUserModel.find({ user_id: userId });

    const mapped = documents
      .map((doc) => this.toDomain(doc))
      .filter((tenantUser): tenantUser is TenantUser => Boolean(tenantUser));

    return { data: mapped };
  }
}
