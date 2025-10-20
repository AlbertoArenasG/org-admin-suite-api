import { Injectable } from '@nestjs/common';

import { Tenant } from '@domain/entities';
import { ITenantWriteRepository } from '@domain/ports/repositories';

import { MongooseTenantBaseRepository } from './mongoose-tenant-base.repository';

@Injectable()
export class MongooseTenantWriteRepositoryImpl
  extends MongooseTenantBaseRepository
  implements ITenantWriteRepository
{
  async create(tenant: Tenant): Promise<{ data: Tenant | null }> {
    const aggregate = this.toMongoose(tenant);

    const tenantEntity = new this.tenantModel(aggregate.tenant);
    await tenantEntity.save();

    const tenantId = tenantEntity.tenant_id;

    const configsEntity = new this.tenantConfigsModel({
      ...aggregate.configs,
      tenant_id: tenantId,
    });
    const themeEntity = new this.tenantThemeModel({
      ...aggregate.theme,
      tenant_id: tenantId,
    });
    const appearanceEntity = new this.tenantAppearanceModel({
      ...aggregate.appearance,
      tenant_id: tenantId,
    });

    await Promise.all([
      configsEntity.save(),
      themeEntity.save(),
      appearanceEntity.save(),
    ]);

    return {
      data: this.toDomain({
        tenant: tenantEntity,
        configs: configsEntity,
        theme: themeEntity,
        appearance: appearanceEntity,
      }),
    };
  }
}
