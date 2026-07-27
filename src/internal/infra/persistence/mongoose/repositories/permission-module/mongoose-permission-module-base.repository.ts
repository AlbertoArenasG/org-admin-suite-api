import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { PermissionModuleRecord } from '@domain/ports/repositories';
import { MongoosePermissionModuleMapper } from '@infra/persistence/mongoose/mappers';
import { PermissionModuleDocument } from '@infra/persistence/mongoose/schemas';

@Injectable()
export class MongoosePermissionModuleBaseRepository {
  constructor(
    @InjectModel(PermissionModuleDocument.name)
    protected readonly permissionModuleModel: Model<PermissionModuleDocument>,
  ) {}

  protected toDomain(
    document: PermissionModuleDocument | null,
  ): PermissionModuleRecord | null {
    return MongoosePermissionModuleMapper.toDomain(document);
  }
}
