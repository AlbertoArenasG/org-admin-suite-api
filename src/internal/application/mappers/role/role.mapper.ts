import { Role } from '@domain/entities';
import { RoleViewDto } from '@application/dto';

export class RoleMapper {
  static toViewDto(
    role: Role,
    createdBy?: RoleViewDto['createdBy'],
    updatedBy?: RoleViewDto['updatedBy'],
  ): RoleViewDto {
    return {
      id: role.id,
      name: role.name,
      code: role.code,
      scope: role.scope,
      isSystem: role.isSystem,
      isImmutable: role.isImmutable,
      isDefault: role.isDefault,
      status: role.status,
      permissions: role.permissions.map((permission) => ({
        module: permission.module,
        operation: permission.operation,
      })),
      createdBy: createdBy ?? null,
      updatedBy: updatedBy ?? null,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }

  static toCollection(
    roles: Role[],
    usersById: Map<string, NonNullable<RoleViewDto['createdBy']>>,
  ): RoleViewDto[] {
    return roles.map((role) =>
      this.toViewDto(
        role,
        role.createdBy ? (usersById.get(role.createdBy) ?? null) : null,
        role.updatedBy ? (usersById.get(role.updatedBy) ?? null) : null,
      ),
    );
  }
}
