import { Injectable } from '@nestjs/common';

import { Tenant } from '@domain/entities';
import { ITenantReadRepository } from '@domain/ports/repositories';
import { TenantDocument } from '@infra/persistence/mongoose/schemas';

import { MongooseTenantBaseRepository } from './mongoose-tenant-base.repository';

@Injectable()
export class MongooseTenantReadRepositoryImpl
  extends MongooseTenantBaseRepository
  implements ITenantReadRepository
{
  async findBySlug(slug: string): Promise<{ data: Tenant | null }> {
    const tenantDoc = await this.tenantModel.findOne({ slug });
    if (!tenantDoc) {
      return { data: null };
    }

    return this.hydrateTenantAggregate(tenantDoc);
  }

  async findById(tenantId: string): Promise<{ data: Tenant | null }> {
    const tenantDoc = await this.tenantModel.findOne({ tenant_id: tenantId });
    if (!tenantDoc) {
      return { data: null };
    }

    return this.hydrateTenantAggregate(tenantDoc);
  }

  private async hydrateTenantAggregate(tenantDoc: TenantDocument) {
    const tenantId = tenantDoc.tenant_id;
    const [configsDoc, themeDoc, appearanceDoc] = await Promise.all([
      this.tenantConfigsModel.findOne({ tenant_id: tenantId }),
      this.tenantThemeModel.findOne({ tenant_id: tenantId }),
      this.tenantAppearanceModel.findOne({ tenant_id: tenantId }),
    ]);

    return {
      data: this.toDomain({
        tenant: tenantDoc,
        configs: configsDoc ?? undefined,
        theme: themeDoc ?? undefined,
        appearance: appearanceDoc ?? undefined,
      }),
    };
  }
}
