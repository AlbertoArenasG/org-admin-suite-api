import { CatalogStatus } from '@domain/entities';
import { PermissionModuleRecord } from '@domain/ports/repositories';
import { PermissionModuleDocument } from '@infra/persistence/mongoose/schemas';

export class MongoosePermissionModuleMapper {
  static toDomain(
    document: PermissionModuleDocument | null,
  ): PermissionModuleRecord | null {
    if (!document) {
      return null;
    }

    return {
      id: document.permission_module_id,
      code: document.code,
      name: document.name,
      status: document.status ?? CatalogStatus.ACTIVE,
      isSystem: document.is_system,
      createdAt: document.createdAt ?? undefined,
      updatedAt: document.updatedAt ?? undefined,
    };
  }

  static toMongoose(module: PermissionModuleRecord) {
    return {
      permission_module_id: module.id,
      code: module.code,
      name: module.name,
      status: module.status,
      is_system: module.isSystem,
    };
  }
}
