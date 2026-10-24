import { AnyBulkWriteOperation, Collection, Document } from 'mongodb';

import {
  CustomerServiceRecordBillingNotificationStatus,
  CustomerServiceRecordBillingStatus,
} from '@domain/entities';

import {
  connectMigrationMongo,
  createMigrationLogger,
  loadMigrationEnv,
  parseMigrationMode,
} from './shared/mongoose-migration.utils';

const COLLECTION_NAME = 'customer_service_records';
const INITIAL_NOTIFICATION = {
  status: CustomerServiceRecordBillingNotificationStatus.NOT_REQUESTED,
  attempted_at: null,
  sent_at: null,
  failure_reason: null,
};

interface HistoricalRecord extends Document {
  invoice?: unknown;
  billing_status?: unknown;
  billing_notification?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
  created_by?: unknown;
  updated_by?: unknown;
}

interface Plan {
  total: number;
  pendingStatus: number;
  pendingNotification: number;
  invoiced: number;
  notSubmitted: number;
  referenceOnly: number;
  removedOnly: number;
  existingStatus: number;
  invalid: number;
}

function hasField(record: HistoricalRecord, field: keyof HistoricalRecord) {
  return Object.prototype.hasOwnProperty.call(record, field);
}

function invoiceParts(invoice: unknown): {
  hasFiles: boolean;
  hasReference: boolean;
  hasRemoved: boolean;
  invalid: boolean;
} {
  if (invoice == null) {
    return {
      hasFiles: false,
      hasReference: false,
      hasRemoved: false,
      invalid: false,
    };
  }
  if (typeof invoice !== 'object' || Array.isArray(invoice)) {
    return {
      hasFiles: false,
      hasReference: false,
      hasRemoved: false,
      invalid: true,
    };
  }
  const value = invoice as Record<string, unknown>;
  const invalid =
    (value.files != null && !Array.isArray(value.files)) ||
    (value.removed_files != null && !Array.isArray(value.removed_files));
  return {
    hasFiles: Array.isArray(value.files) && value.files.length > 0,
    hasReference:
      typeof value.reference_number === 'string' &&
      value.reference_number.trim().length > 0,
    hasRemoved:
      Array.isArray(value.removed_files) && value.removed_files.length > 0,
    invalid,
  };
}

function isValidStatus(
  value: unknown,
): value is CustomerServiceRecordBillingStatus {
  return Object.values(CustomerServiceRecordBillingStatus).includes(
    value as CustomerServiceRecordBillingStatus,
  );
}

function isValidNotification(value: unknown): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const status = (value as Record<string, unknown>).status;
  return Object.values(CustomerServiceRecordBillingNotificationStatus).includes(
    status as CustomerServiceRecordBillingNotificationStatus,
  );
}

export function buildPlan(records: HistoricalRecord[]): Plan {
  const plan: Plan = {
    total: records.length,
    pendingStatus: 0,
    pendingNotification: 0,
    invoiced: 0,
    notSubmitted: 0,
    referenceOnly: 0,
    removedOnly: 0,
    existingStatus: 0,
    invalid: 0,
  };
  for (const record of records) {
    const parts = invoiceParts(record.invoice);
    if (
      parts.invalid ||
      (hasField(record, 'billing_status') &&
        !isValidStatus(record.billing_status)) ||
      (hasField(record, 'billing_notification') &&
        !isValidNotification(record.billing_notification))
    ) {
      plan.invalid += 1;
      continue;
    }
    if (hasField(record, 'billing_status')) {
      plan.existingStatus += 1;
    } else {
      plan.pendingStatus += 1;
      if (parts.hasFiles) plan.invoiced += 1;
      else plan.notSubmitted += 1;
      if (parts.hasReference && !parts.hasFiles) plan.referenceOnly += 1;
      if (parts.hasRemoved && !parts.hasFiles) plan.removedOnly += 1;
    }
    if (!hasField(record, 'billing_notification')) {
      plan.pendingNotification += 1;
    }
  }
  return plan;
}

function auditSnapshot(records: HistoricalRecord[]): Map<string, string> {
  return new Map(
    records.map((record) => [
      String(record._id),
      JSON.stringify([
        record.createdAt,
        record.updatedAt,
        record.created_by,
        record.updated_by,
      ]),
    ]),
  );
}

async function loadRecords(
  collection: Collection<HistoricalRecord>,
): Promise<HistoricalRecord[]> {
  return collection
    .find(
      {},
      {
        projection: {
          invoice: 1,
          billing_status: 1,
          billing_notification: 1,
          createdAt: 1,
          updatedAt: 1,
          created_by: 1,
          updated_by: 1,
        },
      },
    )
    .toArray();
}

export async function apply(
  collection: Collection<HistoricalRecord>,
  records: HistoricalRecord[],
): Promise<number> {
  const operations: AnyBulkWriteOperation<HistoricalRecord>[] = [];
  for (const record of records) {
    const set: Record<string, unknown> = {};
    const filter: Record<string, unknown> = { _id: record._id };
    if (!hasField(record, 'billing_status')) {
      set.billing_status = invoiceParts(record.invoice).hasFiles
        ? CustomerServiceRecordBillingStatus.INVOICED
        : CustomerServiceRecordBillingStatus.NOT_SUBMITTED;
      filter.billing_status = { $exists: false };
    }
    if (!hasField(record, 'billing_notification')) {
      set.billing_notification = INITIAL_NOTIFICATION;
      filter.billing_notification = { $exists: false };
    }
    if (Object.keys(set).length === 0) continue;
    operations.push({ updateOne: { filter, update: { $set: set } } });
  }
  if (operations.length === 0) return 0;
  const result = await collection.bulkWrite(operations, { ordered: true });
  return result.modifiedCount;
}

async function bootstrap(): Promise<void> {
  const mode = parseMigrationMode(process.argv.slice(2));
  const env = loadMigrationEnv();
  const logger = createMigrationLogger();
  const connection = await connectMigrationMongo(env);
  try {
    const collection =
      connection.db!.collection<HistoricalRecord>(COLLECTION_NAME);
    const records = await loadRecords(collection);
    const plan = buildPlan(records);
    logger.info(`Mode: ${mode}`);
    logger.info(`Records total: ${plan.total}`);
    logger.info(`Pending billing status: ${plan.pendingStatus}`);
    logger.info(`Pending billing notification: ${plan.pendingNotification}`);
    logger.info(`Classified INVOICED: ${plan.invoiced}`);
    logger.info(`Classified NOT_SUBMITTED: ${plan.notSubmitted}`);
    logger.info(`Reference only: ${plan.referenceOnly}`);
    logger.info(`Removed files only: ${plan.removedOnly}`);
    logger.info(`Existing billing status: ${plan.existingStatus}`);
    logger.info(`Invalid records: ${plan.invalid}`);
    if (plan.invalid > 0)
      throw new Error('Invalid historical billing data found.');
    if (mode === 'dry-run') {
      logger.info('Dry run finished without writes.');
      return;
    }

    const before = auditSnapshot(records);
    const updated = await apply(collection, records);
    const after = await loadRecords(collection);
    const verification = buildPlan(after);
    const afterAudit = auditSnapshot(after);
    const auditUnchanged = after.every(
      (record) =>
        before.get(String(record._id)) === afterAudit.get(String(record._id)),
    );
    logger.info(`Records updated: ${updated}`);
    logger.info(
      `Pending after apply: ${verification.pendingStatus + verification.pendingNotification}`,
    );
    logger.info(`Audit unchanged: ${auditUnchanged}`);
    if (
      verification.invalid > 0 ||
      verification.pendingStatus > 0 ||
      verification.pendingNotification > 0 ||
      after.length !== records.length ||
      !auditUnchanged
    ) {
      throw new Error('Post-migration integrity check failed.');
    }
    logger.info('Result: SUCCESS');
  } finally {
    await connection.close();
    logger.info('MongoDB connection closed.');
  }
}

if (require.main === module) void bootstrap();
