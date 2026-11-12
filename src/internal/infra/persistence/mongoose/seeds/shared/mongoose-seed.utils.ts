import mongoose from 'mongoose';

import { Env, envSchema } from '@infra/env';

import {
  MongooseSeedContext,
  MongooseSeedLogger,
  SeedReportItem,
} from './mongoose-seed.types';

export function loadSeedEnv(): Env {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile();
  }

  return envSchema.parse(process.env);
}

export function createSeedLogger(): MongooseSeedLogger {
  return {
    info(message: string) {
      console.info(`[db:seed] ${message}`);
    },
    warn(message: string) {
      console.warn(`[db:seed] ${message}`);
    },
    error(message: string) {
      console.error(`[db:seed] ${message}`);
    },
  };
}

export async function connectSeedMongo(
  env: Env,
  dryRun = false,
): Promise<mongoose.Connection> {
  await mongoose.connect(
    env.MONGO_URI,
    dryRun ? { autoIndex: false, autoCreate: false } : {},
  );

  return mongoose.connection;
}

export function createSeedContext(params: {
  connection: mongoose.Connection;
  env: Env;
  logger: MongooseSeedLogger;
  dryRun?: boolean;
}): MongooseSeedContext {
  return {
    connection: params.connection,
    env: params.env,
    logger: params.logger,
    dryRun: params.dryRun,
    now: new Date(),
  };
}

export function formatSeedReportItem(report: SeedReportItem): string {
  return [
    `Seed "${report.name}" completed.`,
    `created=${report.created}`,
    `updated=${report.updated}`,
    `unchanged=${report.unchanged}`,
  ].join(' ');
}
