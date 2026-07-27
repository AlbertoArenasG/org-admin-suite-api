import mongoose from 'mongoose';

import { Env } from '@infra/env';

export interface MongooseSeedLogger {
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

export interface MongooseExecutionContext {
  connection: mongoose.Connection;
  env: Env;
  now: Date;
  logger: MongooseSeedLogger;
}

export type MongooseSeedContext = MongooseExecutionContext;

export interface SeedReportItem {
  name: string;
  created: number;
  updated: number;
  unchanged: number;
}

export interface MongooseSeedDefinition {
  name: string;
  run(context: MongooseSeedContext): Promise<SeedReportItem>;
}
