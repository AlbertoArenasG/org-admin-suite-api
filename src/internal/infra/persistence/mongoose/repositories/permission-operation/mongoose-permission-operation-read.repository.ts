import { Injectable } from '@nestjs/common';

import { CatalogStatus } from '@domain/entities';
import {
  IPermissionOperationReadRepository,
  PermissionOperationRecord,
} from '@domain/ports/repositories';
import { MongoosePermissionOperationBaseRepository } from './mongoose-permission-operation-base.repository';

@Injectable()
export class MongoosePermissionOperationReadRepositoryImpl
  extends MongoosePermissionOperationBaseRepository
  implements IPermissionOperationReadRepository
{
  async findByCode(
    code: string,
  ): Promise<{ data: PermissionOperationRecord | null }> {
    const document = await this.permissionOperationModel
      .findOne({ code })
      .exec();

    return { data: this.toDomain(document) };
  }

  async findAllActive(): Promise<{ data: PermissionOperationRecord[] }> {
    const documents = await this.permissionOperationModel
      .find({ status: CatalogStatus.ACTIVE })
      .sort({ name: 1, createdAt: 1 })
      .exec();

    return {
      data: documents
        .map((document) => this.toDomain(document))
        .filter(
          (operation): operation is PermissionOperationRecord =>
            operation !== null,
        ),
    };
  }
}
