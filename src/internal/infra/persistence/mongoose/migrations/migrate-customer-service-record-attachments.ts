import { AnyBulkWriteOperation, Collection, Document } from 'mongodb';

import {
  connectMigrationMongo,
  createMigrationContext,
  createMigrationLogger,
  loadMigrationEnv,
  parseMigrationMode,
} from './shared/mongoose-migration.utils';
import { MongooseMigrationContext } from './shared/mongoose-migration.types';

const MIGRATION_NAME = 'migrate-customer-service-record-attachments';
const COLLECTION_NAME = 'customer_service_records';

interface HistoricalCustomerServiceRecord extends Document {
  assets?: unknown;
  provider?: unknown;
  quotation?: unknown;
  purchase_order?: unknown;
  invoice?: unknown;
  other_files?: unknown;
  attachments_count?: unknown;
  customer_visible_attachments_count?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
  created_by?: unknown;
  updated_by?: unknown;
}

interface MigrationPlan {
  totalRecords: number;
  pendingRecords: number;
  pendingAssetCollections: number;
  pendingDocumentCollections: number;
  pendingProviderReferences: number;
  pendingCounts: number;
  invalidRecords: number;
}

interface MigrationIntegrity {
  recordsMissingFields: number;
  recordsWithInvalidStructure: number;
  recordsWithChangedAudit: number;
  integrityOk: boolean;
}

type AuditFingerprint = string;

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
    const documents = await loadRecords(records);
    const plan = buildPlan(documents);
    printPlan(context, plan);

    if (plan.invalidRecords > 0) {
      throw new Error(
        'Cannot initialize attachment fields: invalid historical record structures found.',
      );
    }
    if (mode === 'dry-run') {
      logger.info('Dry run finished without writes.');
      return;
    }

    const auditBefore = createAuditSnapshot(documents);
    const updatedRecords = await applyMigration(records, documents);
    const integrity = await verifyIntegrity(records, auditBefore);
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

async function loadRecords(
  records: Collection<HistoricalCustomerServiceRecord>,
): Promise<HistoricalCustomerServiceRecord[]> {
  return records
    .find(
      {},
      {
        projection: {
          assets: 1,
          provider: 1,
          quotation: 1,
          purchase_order: 1,
          invoice: 1,
          other_files: 1,
          attachments_count: 1,
          customer_visible_attachments_count: 1,
          createdAt: 1,
          updatedAt: 1,
          created_by: 1,
          updated_by: 1,
        },
      },
    )
    .toArray();
}

function buildPlan(
  documents: HistoricalCustomerServiceRecord[],
): MigrationPlan {
  let pendingRecords = 0;
  let pendingAssetCollections = 0;
  let pendingDocumentCollections = 0;
  let pendingProviderReferences = 0;
  let pendingCounts = 0;
  let invalidRecords = 0;

  for (const record of documents) {
    const update = buildUpdate(record);
    if (update.invalid) {
      invalidRecords += 1;
      continue;
    }
    const fields = Object.keys(update.set);
    if (fields.length > 0) pendingRecords += 1;
    pendingAssetCollections += fields.filter((field) =>
      field.startsWith('assets.'),
    ).length;
    pendingDocumentCollections += fields.filter((field) =>
      /^(quotation|purchase_order|invoice|other_files)/.test(field),
    ).length;
    pendingProviderReferences += fields.filter(
      (field) => field === 'provider.work_order_reference',
    ).length;
    pendingCounts += fields.filter(
      (field) =>
        field === 'attachments_count' ||
        field === 'customer_visible_attachments_count',
    ).length;
  }

  return {
    totalRecords: documents.length,
    pendingRecords,
    pendingAssetCollections,
    pendingDocumentCollections,
    pendingProviderReferences,
    pendingCounts,
    invalidRecords,
  };
}

async function applyMigration(
  records: Collection<HistoricalCustomerServiceRecord>,
  documents: HistoricalCustomerServiceRecord[],
): Promise<number> {
  const operations: AnyBulkWriteOperation<HistoricalCustomerServiceRecord>[] =
    [];

  for (const record of documents) {
    const update = buildUpdate(record);
    if (update.invalid || Object.keys(update.set).length === 0) continue;
    operations.push({
      updateOne: {
        filter: { _id: record._id },
        update: { $set: update.set },
      },
    });
  }

  if (operations.length > 0) {
    await records.bulkWrite(operations, { ordered: true });
  }
  return operations.length;
}

function buildUpdate(record: HistoricalCustomerServiceRecord): {
  set: Record<string, unknown>;
  invalid: boolean;
} {
  const set: Record<string, unknown> = {};
  if (!Array.isArray(record.assets)) return { set, invalid: true };

  for (const [index, asset] of record.assets.entries()) {
    if (!isPlainObject(asset)) return { set, invalid: true };
    if (
      !addAttachmentCollectionDefaults(
        set,
        `assets.${index}.intake_condition_files`,
        asset.intake_condition_files,
      )
    ) {
      return { set, invalid: true };
    }
    if (
      !addAttachmentCollectionDefaults(
        set,
        `assets.${index}.delivery_condition_files`,
        asset.delivery_condition_files,
      )
    ) {
      return { set, invalid: true };
    }
    if (
      !addAttachmentCollectionDefaults(
        set,
        `assets.${index}.reports`,
        asset.reports,
      )
    ) {
      return { set, invalid: true };
    }
  }

  if (!addDocumentDefaults(set, 'quotation', record.quotation, true)) {
    return { set, invalid: true };
  }
  if (
    !addDocumentDefaults(set, 'purchase_order', record.purchase_order, true)
  ) {
    return { set, invalid: true };
  }
  if (!addDocumentDefaults(set, 'invoice', record.invoice, true)) {
    return { set, invalid: true };
  }
  if (
    !addAttachmentCollectionDefaults(set, 'other_files', record.other_files)
  ) {
    return { set, invalid: true };
  }

  if (
    hasOwn(record, 'attachments_count') &&
    !isNonNegativeInteger(record.attachments_count)
  ) {
    return { set, invalid: true };
  }
  if (!hasOwn(record, 'attachments_count')) set.attachments_count = 0;
  if (
    hasOwn(record, 'customer_visible_attachments_count') &&
    !isNonNegativeInteger(record.customer_visible_attachments_count)
  ) {
    return { set, invalid: true };
  }
  if (!hasOwn(record, 'customer_visible_attachments_count')) {
    set.customer_visible_attachments_count = 0;
  }

  if (record.provider !== undefined && record.provider !== null) {
    if (!isPlainObject(record.provider)) return { set, invalid: true };
    if (
      hasOwn(record.provider, 'work_order_reference') &&
      !isNullableString(record.provider.work_order_reference)
    ) {
      return { set, invalid: true };
    }
    if (!hasOwn(record.provider, 'work_order_reference')) {
      set['provider.work_order_reference'] = null;
    }
  }

  return { set, invalid: false };
}

function addDocumentDefaults(
  set: Record<string, unknown>,
  path: string,
  value: unknown,
  includesReferenceNumber: boolean,
): boolean {
  if (value === undefined) {
    set[path] = includesReferenceNumber
      ? { reference_number: null, files: [], removed_files: [] }
      : { files: [], removed_files: [] };
    return true;
  }
  if (!isPlainObject(value)) return false;

  if (includesReferenceNumber) {
    if (
      hasOwn(value, 'reference_number') &&
      !isNullableString(value.reference_number)
    ) {
      return false;
    }
    if (!hasOwn(value, 'reference_number')) {
      set[`${path}.reference_number`] = null;
    }
  }
  if (hasOwn(value, 'files') && !Array.isArray(value.files)) return false;
  if (hasOwn(value, 'removed_files') && !Array.isArray(value.removed_files)) {
    return false;
  }
  if (!hasOwn(value, 'files')) set[`${path}.files`] = [];
  if (!hasOwn(value, 'removed_files')) set[`${path}.removed_files`] = [];
  return true;
}

function addAttachmentCollectionDefaults(
  set: Record<string, unknown>,
  path: string,
  value: unknown,
): boolean {
  return addDocumentDefaults(set, path, value, false);
}

function createAuditSnapshot(
  documents: HistoricalCustomerServiceRecord[],
): Map<string, AuditFingerprint> {
  return new Map(
    documents.map((record) => [String(record._id), auditFingerprint(record)]),
  );
}

async function verifyIntegrity(
  records: Collection<HistoricalCustomerServiceRecord>,
  auditBefore: Map<string, AuditFingerprint>,
): Promise<MigrationIntegrity> {
  const documents = await loadRecords(records);
  let recordsMissingFields = 0;
  let recordsWithInvalidStructure = 0;
  let recordsWithChangedAudit = 0;

  for (const record of documents) {
    const update = buildUpdate(record);
    if (update.invalid) recordsWithInvalidStructure += 1;
    else if (Object.keys(update.set).length > 0) recordsMissingFields += 1;

    if (auditBefore.get(String(record._id)) !== auditFingerprint(record)) {
      recordsWithChangedAudit += 1;
    }
  }

  return {
    recordsMissingFields,
    recordsWithInvalidStructure,
    recordsWithChangedAudit,
    integrityOk:
      recordsMissingFields === 0 &&
      recordsWithInvalidStructure === 0 &&
      recordsWithChangedAudit === 0,
  };
}

function auditFingerprint(record: HistoricalCustomerServiceRecord): string {
  return JSON.stringify({
    createdAt: record.createdAt ?? null,
    updatedAt: record.updatedAt ?? null,
    created_by: record.created_by ?? null,
    updated_by: record.updated_by ?? null,
  });
}

function hasOwn(value: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === 'string';
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

function printPlan(
  context: MongooseMigrationContext,
  plan: MigrationPlan,
): void {
  context.logger.info(`Records total: ${plan.totalRecords}`);
  context.logger.info(`Records pending migration: ${plan.pendingRecords}`);
  context.logger.info(
    `Pending asset collection fields: ${plan.pendingAssetCollections}`,
  );
  context.logger.info(
    `Pending document collection fields: ${plan.pendingDocumentCollections}`,
  );
  context.logger.info(
    `Pending provider work-order references: ${plan.pendingProviderReferences}`,
  );
  context.logger.info(`Pending attachment counts: ${plan.pendingCounts}`);
  context.logger.info(`Invalid historical records: ${plan.invalidRecords}`);
  context.logger.info(
    'Audit fields excluded from migration updates: createdAt, updatedAt, created_by, updated_by.',
  );
}

void bootstrap();
