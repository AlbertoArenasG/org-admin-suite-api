import { CatalogStatus } from '@domain/entities';
import { PermissionOperationRecord } from '@domain/ports/repositories';
import { PermissionOperationDocument } from '@infra/persistence/mongoose/schemas';

export class MongoosePermissionOperationMapper {
  static toDomain(
    document: PermissionOperationDocument | null,
  ): PermissionOperationRecord | null {
    if (!document) {
      return null;
    }

    return {
      id: document.permission_operation_id,
      code: document.code,
      name: document.name,
      status: document.status ?? CatalogStatus.ACTIVE,
      isSystem: document.is_system,
      createdAt: document.createdAt ?? undefined,
      updatedAt: document.updatedAt ?? undefined,
    };
  }

  static toMongoose(operation: PermissionOperationRecord) {
    return {
      permission_operation_id: operation.id,
      code: operation.code,
      name: operation.name,
      status: operation.status,
      is_system: operation.isSystem,
    };
  }
}
