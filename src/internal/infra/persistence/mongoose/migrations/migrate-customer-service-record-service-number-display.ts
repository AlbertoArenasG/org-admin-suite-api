import { AnyBulkWriteOperation, Collection, Document } from 'mongodb';

import { formatCustomerServiceRecordServiceNumber } from '@domain/entities';

import {
  connectMigrationMongo,
  createMigrationContext,
  createMigrationLogger,
  loadMigrationEnv,
  parseMigrationMode,
} from './shared/mongoose-migration.utils';
import { MongooseMigrationContext } from './shared/mongoose-migration.types';

const MIGRATION_NAME = 'migrate-customer-service-record-service-number-display';
const COLLECTION_NAME = 'customer_service_records';
const DISPLAY_INDEX_NAME = 'service_number_display_1';

interface HistoricalCustomerServiceRecord extends Document {
  service_number?: unknown;
  service_number_display?: unknown;
}

interface MigrationPlan {
  totalRecords: number;
  pendingRecords: number;
  invalidServiceNumbers: number;
  hasDisplayIndex: boolean;
}

interface MigrationIntegrity {
  recordsMissingDisplay: number;
  recordsWithIncorrectDisplay: number;
  hasDisplayIndex: boolean;
  integrityOk: boolean;
}

async function bootstrap() {
  const mode = parseMigrationMode(process.argv.slice(2));
  const env = loadMigrationEnv();
  const logger = createMigrationLogger();
  const connection = await connectMigrationMongo(env);

  try {
    const context = createMigrationContext({ connection, env, logger, mode });
    const records =
      connection.db!.collection<HistoricalCustomerServiceRecord>(
        COLLECTION_NAME,
      );

    logger.info(`Running "${MIGRATION_NAME}" in mode=${mode}.`);
    const plan = await buildPlan(records);
    printPlan(context, plan);

    if (plan.invalidServiceNumbers > 0) {
      throw new Error(
        'Cannot materialize service_number_display: invalid service_number values found.',
      );
    }
    if (mode === 'dry-run') {
      logger.info('Dry run finished without writes.');
      return;
    }

    const updatedRecords = await materializeDisplayValues(records);
    if (!plan.hasDisplayIndex) {
      await records.createIndex(
        { service_number_display: 1 },
        { name: DISPLAY_INDEX_NAME, unique: true },
      );
    }

    const integrity = await verifyIntegrity(records);
    logger.info(`Records updated: ${updatedRecords}`);
    logger.info(`Integrity check: ${integrity.integrityOk ? 'OK' : 'FAILED'}`);
    if (!integrity.integrityOk) {
      throw new Error('Post-migration integrity check failed.');
    }
    logger.info('Result: SUCCESS');
  } finally {
    await connection.close();
    logger.info('MongoDB connection closed.');
  }
}

async function buildPlan(
  records: Collection<HistoricalCustomerServiceRecord>,
): Promise<MigrationPlan> {
  const documents = await records
    .find({}, { projection: { service_number: 1, service_number_display: 1 } })
    .toArray();
  let pendingRecords = 0;
  let invalidServiceNumbers = 0;

  for (const record of documents) {
    if (!isServiceNumber(record.service_number)) {
      invalidServiceNumbers += 1;
      continue;
    }
    if (
      record.service_number_display !==
      formatCustomerServiceRecordServiceNumber(record.service_number)
    ) {
      pendingRecords += 1;
    }
  }

  const indexes = await records.indexes();
  return {
    totalRecords: documents.length,
    pendingRecords,
    invalidServiceNumbers,
    hasDisplayIndex: indexes.some((index) => index.name === DISPLAY_INDEX_NAME),
  };
}

async function materializeDisplayValues(
  records: Collection<HistoricalCustomerServiceRecord>,
): Promise<number> {
  const documents = await records
    .find({}, { projection: { service_number: 1, service_number_display: 1 } })
    .toArray();
  const operations: AnyBulkWriteOperation<HistoricalCustomerServiceRecord>[] =
    [];

  for (const record of documents) {
    if (!isServiceNumber(record.service_number)) continue;
    const display = formatCustomerServiceRecordServiceNumber(
      record.service_number,
    );
    if (record.service_number_display === display) continue;
    operations.push({
      updateOne: {
        filter: { _id: record._id },
        update: { $set: { service_number_display: display } },
      },
    });
  }

  if (operations.length > 0) {
    await records.bulkWrite(operations, { ordered: true });
  }
  return operations.length;
}

async function verifyIntegrity(
  records: Collection<HistoricalCustomerServiceRecord>,
): Promise<MigrationIntegrity> {
  const documents = await records
    .find({}, { projection: { service_number: 1, service_number_display: 1 } })
    .toArray();
  let recordsMissingDisplay = 0;
  let recordsWithIncorrectDisplay = 0;

  for (const record of documents) {
    if (!isServiceNumber(record.service_number)) {
      recordsWithIncorrectDisplay += 1;
      continue;
    }
    const display = formatCustomerServiceRecordServiceNumber(
      record.service_number,
    );
    if (typeof record.service_number_display !== 'string') {
      recordsMissingDisplay += 1;
    } else if (record.service_number_display !== display) {
      recordsWithIncorrectDisplay += 1;
    }
  }

  const indexes = await records.indexes();
  const hasDisplayIndex = indexes.some(
    (index) => index.name === DISPLAY_INDEX_NAME && index.unique === true,
  );
  return {
    recordsMissingDisplay,
    recordsWithIncorrectDisplay,
    hasDisplayIndex,
    integrityOk:
      recordsMissingDisplay === 0 &&
      recordsWithIncorrectDisplay === 0 &&
      hasDisplayIndex,
  };
}

function isServiceNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
}

function printPlan(
  context: MongooseMigrationContext,
  plan: MigrationPlan,
): void {
  context.logger.info(`Records total: ${plan.totalRecords}`);
  context.logger.info(
    `Records pending materialization: ${plan.pendingRecords}`,
  );
  context.logger.info(`Invalid service numbers: ${plan.invalidServiceNumbers}`);
  context.logger.info(`Display index exists: ${plan.hasDisplayIndex}`);
}

void bootstrap();
