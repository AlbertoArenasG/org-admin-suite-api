import { Model } from 'mongoose';

import { AUTHORIZATION_CATALOG } from '@application/services/authz/authorization.catalog';
import { RoleScope, RoleStatus } from '@domain/entities';
import { RoleDocument, RoleSchema } from '@infra/persistence/mongoose/schemas';
import {
  MongooseSeedContext,
  MongooseSeedDefinition,
  SeedReportItem,
} from '../shared/mongoose-seed.types';

interface RolePermissionSeedItem {
  module: string;
  operation: string;
}

interface SystemRoleSeedItem {
  name: string;
  code: string;
  scope: RoleScope;
  permissions: RolePermissionSeedItem[];
}

const BASE_PERMISSIONS: RolePermissionSeedItem[] = Object.values(
  AUTHORIZATION_CATALOG,
).flatMap((moduleItem) =>
  moduleItem.operations.map((operation) => ({
    module: moduleItem.code,
    operation,
  })),
);

const SYSTEM_ROLES: SystemRoleSeedItem[] = [
  {
    name: 'Master Admin',
    code: 'MASTER_ADMIN_DEFAULT',
    scope: RoleScope.MASTER_ADMIN,
    permissions: BASE_PERMISSIONS,
  },
  {
    name: 'Administrador',
    code: 'ADMIN_DEFAULT',
    scope: RoleScope.ADMIN,
    permissions: BASE_PERMISSIONS,
  },
];

function getRoleModel(
  connection: MongooseSeedContext['connection'],
): Model<RoleDocument> {
  return (
    connection.models[RoleDocument.name] ??
    connection.model(RoleDocument.name, RoleSchema)
  );
}

function hasSamePermissions(
  left: RolePermissionSeedItem[],
  right: RolePermissionSeedItem[],
): boolean {
  if (left.length !== right.length) {
    return false;
  }

  const toKey = (permission: RolePermissionSeedItem) =>
    `${permission.module}:${permission.operation}`;

  const leftKeys = left.map(toKey).sort();
  const rightKeys = right.map(toKey).sort();

  return leftKeys.every((key, index) => key === rightKeys[index]);
}

export const systemRolesSeed: MongooseSeedDefinition = {
  name: 'system-roles',
  async run(context: MongooseSeedContext): Promise<SeedReportItem> {
    const roleModel = getRoleModel(context.connection);

    const report: SeedReportItem = {
      name: 'system-roles',
      created: 0,
      updated: 0,
      unchanged: 0,
    };

    for (const role of SYSTEM_ROLES) {
      const existing = await roleModel.findOne({
        code: role.code,
      });

      if (!existing) {
        await roleModel.create({
          role_id: role.code,
          name: role.name,
          code: role.code,
          scope: role.scope,
          is_system: true,
          is_immutable: true,
          is_default: true,
          status: RoleStatus.ACTIVE,
          permissions: role.permissions,
          created_by: null,
          updated_by: null,
        });
        report.created += 1;
        continue;
      }

      let shouldUpdate = false;

      if (existing.name !== role.name) {
        existing.name = role.name;
        shouldUpdate = true;
      }

      if (existing.scope !== role.scope) {
        existing.scope = role.scope;
        shouldUpdate = true;
      }

      if (!existing.is_system) {
        existing.is_system = true;
        shouldUpdate = true;
      }

      if (!existing.is_immutable) {
        existing.is_immutable = true;
        shouldUpdate = true;
      }

      if (!existing.is_default) {
        existing.is_default = true;
        shouldUpdate = true;
      }

      if (existing.status !== RoleStatus.ACTIVE) {
        existing.status = RoleStatus.ACTIVE;
        shouldUpdate = true;
      }

      const existingPermissions = (existing.permissions ?? []).map(
        (permission) => ({
          module: permission.module,
          operation: permission.operation,
        }),
      );

      if (!hasSamePermissions(existingPermissions, role.permissions)) {
        existing.permissions = role.permissions;
        shouldUpdate = true;
      }

      if (shouldUpdate) {
        await existing.save();
        report.updated += 1;
        continue;
      }

      report.unchanged += 1;
    }

    return report;
  },
};
