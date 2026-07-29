import { AnyBulkWriteOperation, Model } from 'mongoose';

import {
  RoleDocument,
  RoleSchema,
  UserDocument,
  UserSchema,
} from '@infra/persistence/mongoose/schemas';

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
} from './shared/mongoose-migration.types';

// Historical operational script kept for traceability and controlled reruns.
// It is not part of the application's ordinary runtime path.

interface RoleIdentityRecord {
  _id: RoleDocument['_id'];
  role_id: string;
  code: string;
}

interface RoleIdentityPlanSummary {
  totalRoles: number;
  alreadyCanonical: number;
  pendingRoles: number;
  totalUsers: number;
  usersAlreadyCanonical: number;
  usersPendingUpdate: number;
  usersWithUnknownRoleId: number;
  blockingInconsistencies: string[];
}

interface RoleIdentityApplySummary {
  updatedRoles: number;
  updatedUsers: number;
}

interface RoleIdentityIntegritySummary {
  rolesWithCanonicalId: number;
  usersWithCanonicalRoleId: number;
  usersWithUnknownRoleId: number;
  integrityOk: boolean;
}

interface RawRoleUpdateOneOperation {
  updateOne: {
    filter: Record<string, unknown>;
    update: Record<string, unknown>;
  };
}

const MIGRATION_NAME = 'migrate-role-ids-to-code';
const TEMP_ROLE_ID_PREFIX = '__TMP_ROLE_ID__';

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

    const roles = await loadRoles(roleModel);
    const plan = await buildPlan(roleModel, userModel, roles);

    printPlanReport(context, plan);

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

    const apply = await applyMigration(roleModel, userModel, roles);
    const integrity = await verifyIntegrity(roleModel, userModel);

    printApplyReport(context, apply, integrity);

    if (!integrity.integrityOk) {
      throw new Error('Post-migration integrity check failed.');
    }

    logger.info('Result: SUCCESS');
  } finally {
    await connection.close();
    logger.info('MongoDB connection closed.');
  }
}

function getRoleModel(context: MongooseMigrationContext): Model<RoleDocument> {
  return (
    context.connection.models[RoleDocument.name] ??
    context.connection.model(RoleDocument.name, RoleSchema)
  );
}

function getUserModel(context: MongooseMigrationContext): Model<UserDocument> {
  return (
    context.connection.models[UserDocument.name] ??
    context.connection.model(UserDocument.name, UserSchema)
  );
}

async function loadRoles(
  roleModel: Model<RoleDocument>,
): Promise<RoleIdentityRecord[]> {
  return roleModel
    .find({})
    .select('_id role_id code')
    .lean<RoleIdentityRecord[]>();
}

async function buildPlan(
  roleModel: Model<RoleDocument>,
  userModel: Model<UserDocument>,
  roles: RoleIdentityRecord[],
): Promise<RoleIdentityPlanSummary> {
  const blockingInconsistencies: string[] = [];
  const codeSet = new Set<string>();
  const roleIdSet = new Set<string>();
  const roleIdToCode = new Map<string, string>();

  let alreadyCanonical = 0;

  for (const role of roles) {
    if (!role.code) {
      blockingInconsistencies.push(`Role ${String(role._id)} has empty code.`);
      continue;
    }

    if (codeSet.has(role.code)) {
      blockingInconsistencies.push(`Duplicated role code "${role.code}".`);
    }

    if (roleIdSet.has(role.role_id)) {
      blockingInconsistencies.push(`Duplicated role_id "${role.role_id}".`);
    }

    codeSet.add(role.code);
    roleIdSet.add(role.role_id);
    roleIdToCode.set(role.role_id, role.code);

    if (role.role_id === role.code) {
      alreadyCanonical += 1;
    }
  }

  const conflictingTemporaryIds = roles.filter((role) =>
    role.role_id.startsWith(TEMP_ROLE_ID_PREFIX),
  );

  if (conflictingTemporaryIds.length > 0) {
    blockingInconsistencies.push(
      `Found ${conflictingTemporaryIds.length} role_id values using reserved temporary prefix ${TEMP_ROLE_ID_PREFIX}.`,
    );
  }

  const roleIdsThatMatchOtherCodes = roles.filter(
    (role) => role.role_id !== role.code && codeSet.has(role.role_id),
  );

  if (roleIdsThatMatchOtherCodes.length > 0) {
    blockingInconsistencies.push(
      `Found ${roleIdsThatMatchOtherCodes.length} non-canonical role_id values that collide with existing role codes.`,
    );
  }

  const [totalUsers, canonicalUserIds, allUsers] = await Promise.all([
    userModel.countDocuments({}),
    userModel.countDocuments({
      role_id: { $in: Array.from(codeSet) },
    }),
    userModel
      .find({})
      .select('user_id email role_id')
      .lean<
        Array<{ user_id: string; email: string; role_id?: string | null }>
      >(),
  ]);

  let usersPendingUpdate = 0;
  let usersWithUnknownRoleId = 0;

  for (const user of allUsers) {
    if (!user.role_id) {
      continue;
    }

    if (codeSet.has(user.role_id)) {
      continue;
    }

    if (roleIdToCode.has(user.role_id)) {
      usersPendingUpdate += 1;
      continue;
    }

    usersWithUnknownRoleId += 1;
    blockingInconsistencies.push(
      `Unknown user.role_id "${user.role_id}" for user ${user.user_id} (${user.email}).`,
    );
  }

  return {
    totalRoles: roles.length,
    alreadyCanonical,
    pendingRoles: roles.length - alreadyCanonical,
    totalUsers,
    usersAlreadyCanonical: canonicalUserIds,
    usersPendingUpdate,
    usersWithUnknownRoleId,
    blockingInconsistencies,
  };
}

async function applyMigration(
  roleModel: Model<RoleDocument>,
  userModel: Model<UserDocument>,
  roles: RoleIdentityRecord[],
): Promise<RoleIdentityApplySummary> {
  const rolesToUpdate = roles.filter((role) => role.role_id !== role.code);

  const userOperations: AnyBulkWriteOperation<UserDocument>[] =
    rolesToUpdate.map((role) => ({
      updateMany: {
        filter: { role_id: role.role_id },
        update: { $set: { role_id: role.code } },
      },
    }));

  if (userOperations.length > 0) {
    await userModel.bulkWrite(userOperations, { ordered: true });
  }

  const tempOperations: RawRoleUpdateOneOperation[] = rolesToUpdate.map(
    (role) => ({
      updateOne: {
        filter: { _id: role._id, role_id: role.role_id },
        update: { $set: { role_id: `${TEMP_ROLE_ID_PREFIX}${role.code}` } },
      },
    }),
  );

  if (tempOperations.length > 0) {
    await roleModel.collection.bulkWrite(tempOperations, { ordered: true });
  }

  const finalOperations: RawRoleUpdateOneOperation[] = rolesToUpdate.map(
    (role) => ({
      updateOne: {
        filter: {
          _id: role._id,
          role_id: `${TEMP_ROLE_ID_PREFIX}${role.code}`,
        },
        update: { $set: { role_id: role.code } },
      },
    }),
  );

  if (finalOperations.length > 0) {
    await roleModel.collection.bulkWrite(finalOperations, { ordered: true });
  }

  const [updatedRoles, updatedUsers] = await Promise.all([
    roleModel.countDocuments({
      $expr: { $eq: ['$role_id', '$code'] },
    }),
    userModel.countDocuments({
      role_id: {
        $in: roles.map((role) => role.code),
      },
    }),
  ]);

  return {
    updatedRoles,
    updatedUsers,
  };
}

async function verifyIntegrity(
  roleModel: Model<RoleDocument>,
  userModel: Model<UserDocument>,
): Promise<RoleIdentityIntegritySummary> {
  const roles = await roleModel
    .find({})
    .select('role_id code')
    .lean<Array<{ role_id: string; code: string }>>();

  const canonicalRoleCodes = roles
    .filter((role) => role.role_id === role.code)
    .map((role) => role.code);

  const [rolesWithCanonicalId, usersWithCanonicalRoleId, allUsers] =
    await Promise.all([
      roleModel.countDocuments({
        $expr: { $eq: ['$role_id', '$code'] },
      }),
      userModel.countDocuments({
        role_id: { $in: canonicalRoleCodes },
      }),
      userModel
        .find({})
        .select('role_id')
        .lean<Array<{ role_id?: string | null }>>(),
    ]);

  const usersWithUnknownRoleId = allUsers.reduce((count, user) => {
    if (!user.role_id) {
      return count;
    }

    return canonicalRoleCodes.includes(user.role_id) ? count : count + 1;
  }, 0);

  return {
    rolesWithCanonicalId,
    usersWithCanonicalRoleId,
    usersWithUnknownRoleId,
    integrityOk:
      rolesWithCanonicalId === roles.length && usersWithUnknownRoleId === 0,
  };
}

function printPlanReport(
  context: MongooseMigrationContext,
  plan: RoleIdentityPlanSummary,
): void {
  context.logger.info(`Migration mode: ${formatMode(context.mode)}`);
  context.logger.info(`Executed at: ${context.now.toISOString()}`);
  context.logger.info(`Roles total: ${plan.totalRoles}`);
  context.logger.info(`Roles already canonical: ${plan.alreadyCanonical}`);
  context.logger.info(`Roles pending canonicalization: ${plan.pendingRoles}`);
  context.logger.info(`Users total: ${plan.totalUsers}`);
  context.logger.info(
    `Users already using canonical role_id: ${plan.usersAlreadyCanonical}`,
  );
  context.logger.info(
    `Users pending role_id update: ${plan.usersPendingUpdate}`,
  );
  context.logger.info(
    `Users with unknown role_id: ${plan.usersWithUnknownRoleId}`,
  );
  context.logger.info(
    `Blocking inconsistencies: ${plan.blockingInconsistencies.length}`,
  );

  for (const inconsistency of plan.blockingInconsistencies) {
    context.logger.error(inconsistency);
  }
}

function printApplyReport(
  context: MongooseMigrationContext,
  apply: RoleIdentityApplySummary,
  integrity: RoleIdentityIntegritySummary,
): void {
  context.logger.info(`Migration mode: ${formatMode(context.mode)}`);
  context.logger.info(`Roles with canonical role_id: ${apply.updatedRoles}`);
  context.logger.info(`Users with canonical role_id: ${apply.updatedUsers}`);
  context.logger.info(
    `Roles canonical after migration: ${integrity.rolesWithCanonicalId}`,
  );
  context.logger.info(
    `Users canonical after migration: ${integrity.usersWithCanonicalRoleId}`,
  );
  context.logger.info(
    `Users with unknown role_id after migration: ${integrity.usersWithUnknownRoleId}`,
  );
  context.logger.info(
    `Integrity check: ${integrity.integrityOk ? 'OK' : 'FAILED'}`,
  );
}

function formatMode(mode: MigrationMode): string {
  return mode.toUpperCase();
}

void bootstrap();
