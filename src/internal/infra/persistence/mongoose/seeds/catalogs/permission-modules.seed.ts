import { Model } from 'mongoose';

import { CatalogStatus } from '@domain/entities';
import {
  PermissionModuleDocument,
  PermissionModuleSchema,
} from '@infra/persistence/mongoose/schemas';
import { genId } from '@src/common/utils';

import {
  MongooseSeedContext,
  MongooseSeedDefinition,
  SeedReportItem,
} from '../shared/mongoose-seed.types';

interface PermissionModuleSeedItem {
  code: string;
  name: string;
}

const PERMISSION_MODULES: PermissionModuleSeedItem[] = [
  { code: 'users', name: 'Users' },
  { code: 'roles', name: 'Roles' },
];

function getPermissionModuleModel(
  connection: MongooseSeedContext['connection'],
): Model<PermissionModuleDocument> {
  return (
    connection.models[PermissionModuleDocument.name] ??
    connection.model(PermissionModuleDocument.name, PermissionModuleSchema)
  );
}

export const permissionModulesSeed: MongooseSeedDefinition = {
  name: 'permission-modules',
  async run(context: MongooseSeedContext): Promise<SeedReportItem> {
    const permissionModuleModel = getPermissionModuleModel(context.connection);

    const report: SeedReportItem = {
      name: 'permission-modules',
      created: 0,
      updated: 0,
      unchanged: 0,
    };

    for (const module of PERMISSION_MODULES) {
      const existing = await permissionModuleModel.findOne({
        code: module.code,
      });

      if (!existing) {
        await permissionModuleModel.create({
          permission_module_id: genId(),
          code: module.code,
          name: module.name,
          status: CatalogStatus.ACTIVE,
          is_system: true,
        });
        report.created += 1;
        continue;
      }

      let shouldUpdate = false;

      if (existing.name !== module.name) {
        existing.name = module.name;
        shouldUpdate = true;
      }

      if (existing.status !== CatalogStatus.ACTIVE) {
        existing.status = CatalogStatus.ACTIVE;
        shouldUpdate = true;
      }

      if (!existing.is_system) {
        existing.is_system = true;
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
