import { Role, RoleStatus } from '@domain/entities';
import { RoleDocument } from '@infra/persistence/mongoose/schemas';

export class MongooseRoleMapper {
  static toDomain(document: RoleDocument | null): Role | null {
    if (!document) {
      return null;
    }

    return new Role({
      id: document.role_id,
      name: document.name,
      code: document.code,
      scope: document.scope,
      isSystem: document.is_system,
      isImmutable: document.is_immutable,
      isDefault: document.is_default,
      status: document.status ?? RoleStatus.ACTIVE,
      permissions: (document.permissions ?? []).map((permission) => ({
        module: permission.module,
        operation: permission.operation,
      })),
      createdBy: document.created_by ?? null,
      updatedBy: document.updated_by ?? null,
      createdAt: document.createdAt ?? undefined,
      updatedAt: document.updatedAt ?? undefined,
    });
  }

  static toMongoose(role: Role) {
    return {
      role_id: role.id,
      name: role.name,
      code: role.code,
      scope: role.scope,
      is_system: role.isSystem,
      is_immutable: role.isImmutable,
      is_default: role.isDefault,
      status: role.status,
      permissions: role.permissions.map((permission) => ({
        module: permission.module,
        operation: permission.operation,
      })),
      created_by: role.createdBy,
      updated_by: role.updatedBy,
    };
  }
}
