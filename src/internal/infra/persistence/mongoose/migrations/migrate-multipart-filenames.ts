import { AnyBulkWriteOperation, Collection, Document } from 'mongodb';

import { normalizeMultipartFilename } from '@src/common/utils';

import {
  connectMigrationMongo,
  createMigrationLogger,
  loadMigrationEnv,
  parseMigrationMode,
} from './shared/mongoose-migration.utils';

const MIGRATION_NAME = 'migrate-multipart-filenames';
const COLLECTION_NAMES = [
  'files',
  'customer_service_records',
  'service_package_records',
] as const;
const FILENAME_FIELDS = new Set(['original_name', 'original_filename']);

type HistoricalDocument = Document & Record<string, unknown>;

interface MigrationSummary {
  changedDocuments: number;
  changedNames: number;
  totalDocuments: number;
}

async function bootstrap() {
  const mode = parseMigrationMode(process.argv.slice(2));
  const env = loadMigrationEnv();
  const logger = createMigrationLogger();
  const connection = await connectMigrationMongo(env);

  try {
    const summary: MigrationSummary = {
      changedDocuments: 0,
      changedNames: 0,
      totalDocuments: 0,
    };

    logger.info(`Running "${MIGRATION_NAME}" in mode=${mode}.`);

    for (const name of COLLECTION_NAMES) {
      const collection = connection.db!.collection<HistoricalDocument>(name);
      const result = await migrateCollection(collection, mode);
      summary.totalDocuments += result.totalDocuments;
      summary.changedDocuments += result.changedDocuments;
      summary.changedNames += result.changedNames;
      logger.info(
        `${name}: ${result.changedNames} names in ${result.changedDocuments} documents require normalization.`,
      );
    }

    logger.info(`Documents scanned: ${summary.totalDocuments}`);
    logger.info(`Documents updated: ${summary.changedDocuments}`);
    logger.info(`Filenames normalized: ${summary.changedNames}`);

    if (mode === 'dry-run') {
      logger.info('Dry run finished without writes.');
      return;
    }

    for (const name of COLLECTION_NAMES) {
      const collection = connection.db!.collection<HistoricalDocument>(name);
      const remaining = await countPendingNormalizations(collection);
      if (remaining > 0) {
        throw new Error(
          `${name}: ${remaining} documents still contain normalizable filenames.`,
        );
      }
    }

    logger.info('Result: SUCCESS');
  } finally {
    await connection.close();
    logger.info('MongoDB connection closed.');
  }
}

async function migrateCollection(
  collection: Collection<HistoricalDocument>,
  mode: 'dry-run' | 'apply',
): Promise<MigrationSummary> {
  const documents = await collection.find({}).toArray();
  const operations: AnyBulkWriteOperation<HistoricalDocument>[] = [];
  let changedNames = 0;

  for (const document of documents) {
    const set = collectNormalizedFilenameUpdates(document);
    const fields = Object.keys(set);
    if (!fields.length) continue;

    changedNames += fields.length;
    operations.push({
      updateOne: {
        filter: { _id: document._id },
        update: { $set: set },
      },
    });
  }

  if (mode === 'apply' && operations.length) {
    await collection.bulkWrite(operations, { ordered: true });
  }

  return {
    totalDocuments: documents.length,
    changedDocuments: operations.length,
    changedNames,
  };
}

async function countPendingNormalizations(
  collection: Collection<HistoricalDocument>,
): Promise<number> {
  const documents = await collection.find({}).toArray();
  return documents.filter(
    (document) =>
      Object.keys(collectNormalizedFilenameUpdates(document)).length > 0,
  ).length;
}

function collectNormalizedFilenameUpdates(
  value: unknown,
  path = '',
  set: Record<string, string> = {},
): Record<string, string> {
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      collectNormalizedFilenameUpdates(
        item,
        joinPath(path, String(index)),
        set,
      );
    });
    return set;
  }

  if (!isPlainObject(value)) return set;

  for (const [key, child] of Object.entries(value)) {
    const childPath = joinPath(path, key);
    if (FILENAME_FIELDS.has(key) && typeof child === 'string') {
      const normalized = normalizeMultipartFilename(child);
      if (normalized !== child) set[childPath] = normalized;
      continue;
    }
    collectNormalizedFilenameUpdates(child, childPath, set);
  }

  return set;
}

function joinPath(parent: string, child: string): string {
  return parent ? `${parent}.${child}` : child;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object') return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

void bootstrap();
