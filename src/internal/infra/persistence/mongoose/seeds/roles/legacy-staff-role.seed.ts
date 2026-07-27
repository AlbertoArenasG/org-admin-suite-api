import { Model } from 'mongoose';

import { RoleScope, RoleStatus } from '@domain/entities';
import { RoleDocument, RoleSchema } from '@infra/persistence/mongoose/schemas';
import { genId } from '@src/common/utils';

import {
  MongooseSeedContext,
  MongooseSeedDefinition,
  SeedReportItem,
} from '../shared/mongoose-seed.types';

function getRoleModel(
  connection: MongooseSeedContext['connection'],
): Model<RoleDocument> {
  return (
    connection.models[RoleDocument.name] ??
    connection.model(RoleDocument.name, RoleSchema)
  );
}

export const legacyStaffRoleSeed: MongooseSeedDefinition = {
  name: 'legacy-staff-role',
  async run(context: MongooseSeedContext): Promise<SeedReportItem> {
    const roleModel = getRoleModel(context.connection);

    const report: SeedReportItem = {
      name: 'legacy-staff-role',
      created: 0,
      updated: 0,
      unchanged: 0,
    };

    const existing = await roleModel.findOne({
      code: 'STAFF_LEGACY',
    });

    if (!existing) {
      await roleModel.create({
        role_id: genId(),
        name: 'Staff Legacy',
        code: 'STAFF_LEGACY',
        scope: RoleScope.USER,
        is_system: false,
        is_immutable: false,
        is_default: false,
        status: RoleStatus.ACTIVE,
        permissions: [],
        created_by: null,
        updated_by: null,
      });

      report.created = 1;
      return report;
    }

    let shouldUpdate = false;

    if (existing.name !== 'Staff Legacy') {
      existing.name = 'Staff Legacy';
      shouldUpdate = true;
    }

    if (existing.scope !== RoleScope.USER) {
      existing.scope = RoleScope.USER;
      shouldUpdate = true;
    }

    if (existing.is_system) {
      existing.is_system = false;
      shouldUpdate = true;
    }

    if (existing.is_immutable) {
      existing.is_immutable = false;
      shouldUpdate = true;
    }

    if (existing.is_default) {
      existing.is_default = false;
      shouldUpdate = true;
    }

    if (existing.status !== RoleStatus.ACTIVE) {
      existing.status = RoleStatus.ACTIVE;
      shouldUpdate = true;
    }

    if ((existing.permissions ?? []).length > 0) {
      existing.permissions = [];
      shouldUpdate = true;
    }

    if (shouldUpdate) {
      await existing.save();
      report.updated = 1;
      return report;
    }

    report.unchanged = 1;
    return report;
  },
};
