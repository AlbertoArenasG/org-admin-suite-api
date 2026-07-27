import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { PermissionOperationRecord } from '@domain/ports/repositories';
import { MongoosePermissionOperationMapper } from '@infra/persistence/mongoose/mappers';
import { PermissionOperationDocument } from '@infra/persistence/mongoose/schemas';

@Injectable()
export class MongoosePermissionOperationBaseRepository {
  constructor(
    @InjectModel(PermissionOperationDocument.name)
    protected readonly permissionOperationModel: Model<PermissionOperationDocument>,
  ) {}

  protected toDomain(
    document: PermissionOperationDocument | null,
  ): PermissionOperationRecord | null {
    return MongoosePermissionOperationMapper.toDomain(document);
  }
}
