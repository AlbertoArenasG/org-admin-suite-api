import { Injectable } from '@nestjs/common';

import { CatalogStatus } from '@domain/entities';
import {
  IPermissionModuleReadRepository,
  PermissionModuleRecord,
} from '@domain/ports/repositories';
import { MongoosePermissionModuleBaseRepository } from './mongoose-permission-module-base.repository';

@Injectable()
export class MongoosePermissionModuleReadRepositoryImpl
  extends MongoosePermissionModuleBaseRepository
  implements IPermissionModuleReadRepository
{
  async findByCode(
    code: string,
  ): Promise<{ data: PermissionModuleRecord | null }> {
    const document = await this.permissionModuleModel.findOne({ code }).exec();

    return { data: this.toDomain(document) };
  }

  async findAllActive(): Promise<{ data: PermissionModuleRecord[] }> {
    const documents = await this.permissionModuleModel
      .find({ status: CatalogStatus.ACTIVE })
      .sort({ name: 1, createdAt: 1 })
      .exec();

    return {
      data: documents
        .map((document) => this.toDomain(document))
        .filter((module): module is PermissionModuleRecord => module !== null),
    };
  }
}
