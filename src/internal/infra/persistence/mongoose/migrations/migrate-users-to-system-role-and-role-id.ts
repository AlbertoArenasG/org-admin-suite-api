import { AnyBulkWriteOperation, Model } from 'mongoose';

import {
  RoleDocument,
  RoleSchema,
  UserDocument,
  UserSchema,
} from '@infra/persistence/mongoose/schemas';
import { SystemRole, UserRole } from '@domain/entities';

import {
  connectMigrationMongo,
  createMigrationContext,
  createMigrationLogger,
  loadMigrationEnv,
  parseMigrationMode,
} from './shared/mongoose-migration.utils';
import {
  MigrationMode,
  MongooseMigrationContext,
  UserMigrationApplySummary,
  UserMigrationIntegritySummary,
  UserMigrationPlanSummary,
} from './shared/mongoose-migration.types';

type LegacyMigratableRole =
  | UserRole.MASTER_ADMIN
  | UserRole.ADMIN
  | UserRole.STAFF;

interface MigrationTargetRole {
  code: string;
  roleId: string;
}

interface PendingUserRecord {
  _id: UserDocument['_id'];
  user_id: string;
  email: string;
  role: UserRole;
  system_role?: SystemRole;
  role_id?: string | null;
}

interface MigrationDependencies {
  masterAdminDefault: MigrationTargetRole;
  adminDefault: MigrationTargetRole;
  staffLegacy: MigrationTargetRole;
}

const MIGRATION_NAME = 'migrate-users-to-system-role-and-role-id';

async function bootstrap() {
  const mode = parseMigrationMode(process.argv.slice(2));
  const env = loadMigrationEnv();
  const logger = createMigrationLogger();
  const connection = await connectMigrationMongo(env);

  try {
    const context = createMigrationContext({
      connection,
      env,
      logger,
      mode,
    });

    logger.info(`Running "${MIGRATION_NAME}" in mode=${formatMode(mode)}.`);

    const roleModel = getRoleModel(context);
    const userModel = getUserModel(context);

    const dependencies = await loadDependencies(roleModel);
    const plan = await buildMigrationPlan(userModel, dependencies);

    printPlanReport(context, plan, dependencies);

    if (plan.blockingInconsistencies.length > 0) {
      throw new Error(
        `Blocking inconsistencies detected: ${plan.blockingInconsistencies.join(
          ' | ',
        )}`,
      );
    }

    if (mode === 'dry-run') {
      logger.info('Dry run finished without writes.');
      return;
    }

    const applySummary = await applyMigration(userModel, dependencies);
    const integrity = await verifyIntegrity(userModel, dependencies);

    printApplyReport(context, applySummary, integrity);

    if (!integrity.integrityOk) {
      throw new Error('Post-migration integrity check failed.');
    }

    logger.info('Result: SUCCESS');
  } finally {
    await connection.close();
    logger.info('MongoDB connection closed.');
  }
}

function getUserModel(context: MongooseMigrationContext): Model<UserDocument> {
  return (
    context.connection.models[UserDocument.name] ??
    context.connection.model(UserDocument.name, UserSchema)
  );
}

function getRoleModel(context: MongooseMigrationContext): Model<RoleDocument> {
  return (
    context.connection.models[RoleDocument.name] ??
    context.connection.model(RoleDocument.name, RoleSchema)
  );
}

async function loadDependencies(
  roleModel: Model<RoleDocument>,
): Promise<MigrationDependencies> {
  const [masterAdminDefault, adminDefault, staffLegacy] = await Promise.all([
    roleModel.findOne({ code: 'MASTER_ADMIN_DEFAULT' }).lean(),
    roleModel.findOne({ code: 'ADMIN_DEFAULT' }).lean(),
    roleModel.findOne({ code: 'STAFF_LEGACY' }).lean(),
  ]);

  if (!masterAdminDefault || !adminDefault || !staffLegacy) {
    const missing = [
      !masterAdminDefault ? 'MASTER_ADMIN_DEFAULT' : null,
      !adminDefault ? 'ADMIN_DEFAULT' : null,
      !staffLegacy ? 'STAFF_LEGACY' : null,
    ].filter(Boolean);

    throw new Error(
      `Missing required roles for migration: ${missing.join(', ')}.`,
    );
  }

  return {
    masterAdminDefault: {
      code: 'MASTER_ADMIN_DEFAULT',
      roleId: masterAdminDefault.role_id,
    },
    adminDefault: {
      code: 'ADMIN_DEFAULT',
      roleId: adminDefault.role_id,
    },
    staffLegacy: {
      code: 'STAFF_LEGACY',
      roleId: staffLegacy.role_id,
    },
  };
}

async function buildMigrationPlan(
  userModel: Model<UserDocument>,
  dependencies: MigrationDependencies,
): Promise<UserMigrationPlanSummary> {
  const [
    totalUsers,
    alreadyMigrated,
    pendingUsers,
    customerCount,
    masterStaffCount,
    expectedMasterAdmins,
    expectedAdmins,
    expectedStaff,
  ] = await Promise.all([
    userModel.countDocuments({}),
    userModel.countDocuments({
      system_role: { $exists: true, $ne: null },
      role_id: { $exists: true, $ne: null },
    }),
    userModel
      .find({
        $or: [
          { system_role: { $exists: false } },
          { system_role: null },
          { role_id: { $exists: false } },
          { role_id: null },
        ],
      })
      .select('user_id email role system_role role_id')
      .lean<PendingUserRecord[]>(),
    userModel.countDocuments({ role: UserRole.CUSTOMER }),
    userModel.countDocuments({ role: UserRole.MASTER_STAFF }),
    userModel.countDocuments({
      role: UserRole.MASTER_ADMIN,
      system_role: SystemRole.MASTER_ADMIN,
      role_id: dependencies.masterAdminDefault.roleId,
    }),
    userModel.countDocuments({
      role: UserRole.ADMIN,
      system_role: SystemRole.ADMIN,
      role_id: dependencies.adminDefault.roleId,
    }),
    userModel.countDocuments({
      role: UserRole.STAFF,
      system_role: SystemRole.USER,
      role_id: dependencies.staffLegacy.roleId,
    }),
  ]);

  let pendingMasterAdmin = 0;
  let pendingAdmin = 0;
  let pendingStaff = 0;
  let unexpectedRoles = 0;
  let usersMissingSystemRole = 0;
  let usersMissingRoleId = 0;
  const blockingInconsistencies: string[] = [];

  for (const user of pendingUsers) {
    if (!user.system_role) {
      usersMissingSystemRole += 1;
    }

    if (!user.role_id) {
      usersMissingRoleId += 1;
    }

    if (user.role === UserRole.MASTER_ADMIN) {
      pendingMasterAdmin += 1;
      continue;
    }

    if (user.role === UserRole.ADMIN) {
      pendingAdmin += 1;
      continue;
    }

    if (user.role === UserRole.STAFF) {
      pendingStaff += 1;
      continue;
    }

    unexpectedRoles += 1;
    blockingInconsistencies.push(
      `Unexpected legacy role "${user.role}" for user ${user.user_id} (${user.email})`,
    );
  }

  if (customerCount > 0) {
    blockingInconsistencies.push(
      `Found ${customerCount} users with legacy role CUSTOMER.`,
    );
  }

  if (masterStaffCount > 0) {
    blockingInconsistencies.push(
      `Found ${masterStaffCount} users with legacy role MASTER_STAFF.`,
    );
  }

  const summary: UserMigrationPlanSummary = {
    totalUsers,
    alreadyMigrated,
    pendingMigration: pendingUsers.length,
    pendingMasterAdmin,
    pendingAdmin,
    pendingStaff,
    unexpectedRoles,
    usersMissingSystemRole,
    usersMissingRoleId,
    blockingInconsistencies,
  };

  if (
    summary.pendingMigration !==
    summary.pendingMasterAdmin +
      summary.pendingAdmin +
      summary.pendingStaff +
      summary.unexpectedRoles
  ) {
    summary.blockingInconsistencies.push(
      'Pending migration summary is internally inconsistent.',
    );
  }

  if (
    expectedMasterAdmins + expectedAdmins + expectedStaff >
    summary.totalUsers
  ) {
    summary.blockingInconsistencies.push(
      'Already-migrated counts exceed total users.',
    );
  }

  return summary;
}

async function applyMigration(
  userModel: Model<UserDocument>,
  dependencies: MigrationDependencies,
): Promise<UserMigrationApplySummary> {
  const pendingUsers = await userModel
    .find({
      $or: [
        { system_role: { $exists: false } },
        { system_role: null },
        { role_id: { $exists: false } },
        { role_id: null },
      ],
      role: {
        $in: [UserRole.MASTER_ADMIN, UserRole.ADMIN, UserRole.STAFF],
      },
    })
    .select('_id role')
    .lean<Array<{ _id: UserDocument['_id']; role: LegacyMigratableRole }>>();

  const operations: AnyBulkWriteOperation<UserDocument>[] = pendingUsers.map(
    (user) => ({
      updateOne: {
        filter: {
          _id: user._id,
          $or: [
            { system_role: { $exists: false } },
            { system_role: null },
            { role_id: { $exists: false } },
            { role_id: null },
          ],
        },
        update: buildUserMigrationUpdate(user.role, dependencies),
      },
    }),
  );

  if (operations.length === 0) {
    return {
      updatedMasterAdmin: 0,
      updatedAdmin: 0,
      updatedStaff: 0,
      updatedTotal: 0,
    };
  }

  await userModel.bulkWrite(operations, { ordered: true });

  const [updatedMasterAdmin, updatedAdmin, updatedStaff] = await Promise.all([
    userModel.countDocuments({
      role: UserRole.MASTER_ADMIN,
      system_role: SystemRole.MASTER_ADMIN,
      role_id: dependencies.masterAdminDefault.roleId,
    }),
    userModel.countDocuments({
      role: UserRole.ADMIN,
      system_role: SystemRole.ADMIN,
      role_id: dependencies.adminDefault.roleId,
    }),
    userModel.countDocuments({
      role: UserRole.STAFF,
      system_role: SystemRole.USER,
      role_id: dependencies.staffLegacy.roleId,
    }),
  ]);

  return {
    updatedMasterAdmin,
    updatedAdmin,
    updatedStaff,
    updatedTotal: updatedMasterAdmin + updatedAdmin + updatedStaff,
  };
}

function buildUserMigrationUpdate(
  role: LegacyMigratableRole,
  dependencies: MigrationDependencies,
): Record<string, unknown> {
  if (role === UserRole.MASTER_ADMIN) {
    return {
      $set: {
        system_role: SystemRole.MASTER_ADMIN,
        role_id: dependencies.masterAdminDefault.roleId,
      },
    };
  }

  if (role === UserRole.ADMIN) {
    return {
      $set: {
        system_role: SystemRole.ADMIN,
        role_id: dependencies.adminDefault.roleId,
      },
    };
  }

  return {
    $set: {
      system_role: SystemRole.USER,
      role_id: dependencies.staffLegacy.roleId,
    },
  };
}

async function verifyIntegrity(
  userModel: Model<UserDocument>,
  dependencies: MigrationDependencies,
): Promise<UserMigrationIntegritySummary> {
  const [
    totalUsers,
    usersWithSystemRole,
    usersWithRoleId,
    unexpectedPending,
    masterAdminMapped,
    adminMapped,
    staffMapped,
  ] = await Promise.all([
    userModel.countDocuments({}),
    userModel.countDocuments({
      system_role: { $exists: true, $ne: null },
    }),
    userModel.countDocuments({
      role_id: { $exists: true, $ne: null },
    }),
    userModel.countDocuments({
      $or: [
        { system_role: { $exists: false } },
        { system_role: null },
        { role_id: { $exists: false } },
        { role_id: null },
      ],
      role: {
        $in: [UserRole.MASTER_ADMIN, UserRole.ADMIN, UserRole.STAFF],
      },
    }),
    userModel.countDocuments({
      role: UserRole.MASTER_ADMIN,
      system_role: SystemRole.MASTER_ADMIN,
      role_id: dependencies.masterAdminDefault.roleId,
    }),
    userModel.countDocuments({
      role: UserRole.ADMIN,
      system_role: SystemRole.ADMIN,
      role_id: dependencies.adminDefault.roleId,
    }),
    userModel.countDocuments({
      role: UserRole.STAFF,
      system_role: SystemRole.USER,
      role_id: dependencies.staffLegacy.roleId,
    }),
  ]);

  const integrityOk =
    usersWithSystemRole === totalUsers &&
    usersWithRoleId === totalUsers &&
    unexpectedPending === 0;

  return {
    usersWithSystemRole,
    usersWithRoleId,
    masterAdminMapped,
    adminMapped,
    staffMapped,
    integrityOk,
  };
}

function printPlanReport(
  context: MongooseMigrationContext,
  plan: UserMigrationPlanSummary,
  dependencies: MigrationDependencies,
): void {
  context.logger.info(`Migration mode: ${formatMode(context.mode)}`);
  context.logger.info(`Executed at: ${context.now.toISOString()}`);
  context.logger.info(`Users total: ${plan.totalUsers}`);
  context.logger.info(`Already migrated: ${plan.alreadyMigrated}`);
  context.logger.info(`Pending migration: ${plan.pendingMigration}`);
  context.logger.info(
    `To migrate MASTER_ADMIN -> ${dependencies.masterAdminDefault.code}: ${plan.pendingMasterAdmin}`,
  );
  context.logger.info(
    `To migrate ADMIN -> ${dependencies.adminDefault.code}: ${plan.pendingAdmin}`,
  );
  context.logger.info(
    `To migrate STAFF -> ${dependencies.staffLegacy.code}: ${plan.pendingStaff}`,
  );
  context.logger.info(`Unexpected roles: ${plan.unexpectedRoles}`);
  context.logger.info(
    `Users missing system_role: ${plan.usersMissingSystemRole}`,
  );
  context.logger.info(`Users missing role_id: ${plan.usersMissingRoleId}`);
  context.logger.info(
    `Blocking inconsistencies: ${plan.blockingInconsistencies.length}`,
  );

  for (const inconsistency of plan.blockingInconsistencies) {
    context.logger.error(inconsistency);
  }
}

function printApplyReport(
  context: MongooseMigrationContext,
  apply: UserMigrationApplySummary,
  integrity: UserMigrationIntegritySummary,
): void {
  context.logger.info(`Migration mode: ${formatMode(context.mode)}`);
  context.logger.info(
    `Updated MASTER_ADMIN users: ${apply.updatedMasterAdmin}`,
  );
  context.logger.info(`Updated ADMIN users: ${apply.updatedAdmin}`);
  context.logger.info(`Updated STAFF users: ${apply.updatedStaff}`);
  context.logger.info(`Updated total users: ${apply.updatedTotal}`);
  context.logger.info(
    `Users with system_role after migration: ${integrity.usersWithSystemRole}`,
  );
  context.logger.info(
    `Users with role_id after migration: ${integrity.usersWithRoleId}`,
  );
  context.logger.info(
    `MASTER_ADMIN mapped to default role: ${integrity.masterAdminMapped}`,
  );
  context.logger.info(`ADMIN mapped to default role: ${integrity.adminMapped}`);
  context.logger.info(`STAFF mapped to STAFF_LEGACY: ${integrity.staffMapped}`);
  context.logger.info(
    `Integrity check: ${integrity.integrityOk ? 'OK' : 'FAILED'}`,
  );
}

function formatMode(mode: MigrationMode): string {
  return mode === 'apply' ? 'APPLY' : 'DRY_RUN';
}

void bootstrap().catch((error: unknown) => {
  console.error(`[db:migrate] Migration "${MIGRATION_NAME}" failed.`, error);
  process.exitCode = 1;
});
