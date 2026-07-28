import mongoose from 'mongoose';

import { Env } from '@infra/env';

export type MigrationMode = 'dry-run' | 'apply';

export interface MongooseMigrationLogger {
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

export interface MongooseMigrationContext {
  connection: mongoose.Connection;
  env: Env;
  now: Date;
  logger: MongooseMigrationLogger;
  mode: MigrationMode;
}

export interface UserMigrationPlanSummary {
  totalUsers: number;
  alreadyMigrated: number;
  pendingMigration: number;
  pendingMasterAdmin: number;
  pendingAdmin: number;
  pendingStaff: number;
  unexpectedRoles: number;
  usersMissingSystemRole: number;
  usersMissingRoleId: number;
  blockingInconsistencies: string[];
}

export interface UserMigrationApplySummary {
  updatedMasterAdmin: number;
  updatedAdmin: number;
  updatedStaff: number;
  updatedTotal: number;
}

export interface UserMigrationIntegritySummary {
  usersWithSystemRole: number;
  usersWithRoleId: number;
  masterAdminMapped: number;
  adminMapped: number;
  staffMapped: number;
  integrityOk: boolean;
}
