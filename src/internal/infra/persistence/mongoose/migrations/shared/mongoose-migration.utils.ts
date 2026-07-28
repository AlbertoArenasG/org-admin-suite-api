import mongoose from 'mongoose';

import { Env, envSchema } from '@infra/env';

import {
  MigrationMode,
  MongooseMigrationContext,
  MongooseMigrationLogger,
} from './mongoose-migration.types';

export function loadMigrationEnv(): Env {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile();
  }

  return envSchema.parse(process.env);
}

export function parseMigrationMode(argv: string[]): MigrationMode {
  const hasDryRun = argv.includes('--dry-run');
  const hasApply = argv.includes('--apply');

  if (hasDryRun === hasApply) {
    throw new Error('You must provide exactly one mode: --dry-run or --apply.');
  }

  return hasApply ? 'apply' : 'dry-run';
}

export function createMigrationLogger(): MongooseMigrationLogger {
  return {
    info(message: string) {
      console.info(`[db:migrate] ${message}`);
    },
    warn(message: string) {
      console.warn(`[db:migrate] ${message}`);
    },
    error(message: string) {
      console.error(`[db:migrate] ${message}`);
    },
  };
}

export async function connectMigrationMongo(
  env: Env,
): Promise<mongoose.Connection> {
  await mongoose.connect(env.MONGO_URI);

  return mongoose.connection;
}

export function createMigrationContext(params: {
  connection: mongoose.Connection;
  env: Env;
  logger: MongooseMigrationLogger;
  mode: MigrationMode;
}): MongooseMigrationContext {
  return {
    connection: params.connection,
    env: params.env,
    logger: params.logger,
    mode: params.mode,
    now: new Date(),
  };
}
