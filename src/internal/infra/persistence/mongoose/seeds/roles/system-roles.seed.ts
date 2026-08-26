import { Model } from 'mongoose';

import { AUTHORIZATION_CATALOG } from '@application/services/authz/authorization.catalog';
import { deriveAuxiliaryCapabilitiesFromPermissions } from '@application/services/authz/auxiliary-capabilities/auxiliary-capabilities.service';
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

interface RoleAuxiliaryCapabilitySeedItem {
  module: string;
  capability: string;
}

interface PersistedRolePermission {
  module: string;
  operation: string;
}

interface PersistedRoleAuxiliaryCapability {
  module: string;
  capability: string;
}

interface SystemRoleSeedItem {
  name: string;
  code: string;
  scope: RoleScope;
  permissions: RolePermissionSeedItem[];
  auxiliaryCapabilities: RoleAuxiliaryCapabilitySeedItem[];
}

const BASE_PERMISSIONS: RolePermissionSeedItem[] = Object.values(
  AUTHORIZATION_CATALOG,
).flatMap((moduleItem) =>
  moduleItem.operations.map((operation) => ({
    module: moduleItem.code,
    operation,
  })),
);

const BASE_AUXILIARY_CAPABILITIES =
  deriveAuxiliaryCapabilitiesFromPermissions(BASE_PERMISSIONS);

const SYSTEM_ROLES: SystemRoleSeedItem[] = [
  {
    name: 'Master Admin',
    code: 'MASTER_ADMIN_DEFAULT',
    scope: RoleScope.MASTER_ADMIN,
    permissions: BASE_PERMISSIONS,
    auxiliaryCapabilities: BASE_AUXILIARY_CAPABILITIES,
  },
  {
    name: 'Administrador',
    code: 'ADMIN_DEFAULT',
    scope: RoleScope.ADMIN,
    permissions: BASE_PERMISSIONS,
    auxiliaryCapabilities: BASE_AUXILIARY_CAPABILITIES,
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

function hasSameAuxiliaryCapabilities(
  left: RoleAuxiliaryCapabilitySeedItem[],
  right: RoleAuxiliaryCapabilitySeedItem[],
): boolean {
  if (left.length !== right.length) {
    return false;
  }

  const toKey = (capability: RoleAuxiliaryCapabilitySeedItem) =>
    `${capability.module}:${capability.capability}`;

  const leftKeys = left.map(toKey).sort();
  const rightKeys = right.map(toKey).sort();

  return leftKeys.every((key, index) => key === rightKeys[index]);
}

function toPersistedPermissions(
  permissions: PersistedRolePermission[] | null | undefined,
): RolePermissionSeedItem[] {
  return (permissions ?? []).map((permission) => ({
    module: permission.module,
    operation: permission.operation,
  }));
}

function toPersistedAuxiliaryCapabilities(
  capabilities: PersistedRoleAuxiliaryCapability[] | null | undefined,
): RoleAuxiliaryCapabilitySeedItem[] {
  return (capabilities ?? []).map((capability) => ({
    module: capability.module,
    capability: capability.capability,
  }));
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
          auxiliary_capabilities: role.auxiliaryCapabilities,
          created_by: null,
          updated_by: null,
        });
        report.created += 1;
        continue;
      }

      const updates: Record<string, unknown> = {};

      if (existing.name !== role.name) {
        updates.name = role.name;
      }

      if (existing.scope !== role.scope) {
        updates.scope = role.scope;
      }

      if (!existing.is_system) {
        updates.is_system = true;
      }

      if (!existing.is_immutable) {
        updates.is_immutable = true;
      }

      if (!existing.is_default) {
        updates.is_default = true;
      }

      if (existing.status !== RoleStatus.ACTIVE) {
        updates.status = RoleStatus.ACTIVE;
      }

      const existingPermissions = toPersistedPermissions(existing.permissions);
      const existingAuxiliaryCapabilities = toPersistedAuxiliaryCapabilities(
        existing.auxiliary_capabilities,
      );

      if (!hasSamePermissions(existingPermissions, role.permissions)) {
        updates.permissions = role.permissions;
      }

      if (
        !hasSameAuxiliaryCapabilities(
          existingAuxiliaryCapabilities,
          role.auxiliaryCapabilities,
        )
      ) {
        updates.auxiliary_capabilities = role.auxiliaryCapabilities;
      }

      if (Object.keys(updates).length > 0) {
        await roleModel.collection.updateOne(
          { _id: existing._id },
          { $set: updates },
        );
        report.updated += 1;
        continue;
      }

      report.unchanged += 1;
    }

    const customRoles = await roleModel
      .find({ is_system: false })
      .select({ _id: 1, permissions: 1, auxiliary_capabilities: 1 })
      .lean()
      .exec();

    let customRolesUpdated = 0;
    let customRolesUnchanged = 0;
    const bulkUpdates = customRoles.flatMap((role) => {
      const permissions = toPersistedPermissions(role.permissions);
      const expectedCapabilities =
        deriveAuxiliaryCapabilitiesFromPermissions(permissions);
      const currentCapabilities = toPersistedAuxiliaryCapabilities(
        role.auxiliary_capabilities,
      );

      if (
        hasSameAuxiliaryCapabilities(currentCapabilities, expectedCapabilities)
      ) {
        customRolesUnchanged += 1;
        return [];
      }

      customRolesUpdated += 1;
      return [
        {
          updateOne: {
            filter: { _id: role._id },
            update: { $set: { auxiliary_capabilities: expectedCapabilities } },
          },
        },
      ];
    });

    if (bulkUpdates.length > 0) {
      await roleModel.collection.bulkWrite(bulkUpdates);
    }

    report.updated += customRolesUpdated;
    report.unchanged += customRolesUnchanged;
    context.logger.info(
      `system-roles: custom_roles=${customRoles.length} updated=${customRolesUpdated} unchanged=${customRolesUnchanged}`,
    );

    return report;
  },
};
