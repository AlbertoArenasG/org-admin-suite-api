import { Collection, Document } from 'mongodb';
import {
  CustomerServiceRecordBillingStatus,
  CustomerServiceRecordInvoiceStatus,
} from '@domain/entities';
import {
  connectMigrationMongo,
  createMigrationLogger,
  loadMigrationEnv,
  parseMigrationMode,
} from './shared/mongoose-migration.utils';

interface HistoricalRecord extends Document {
  billing_status?: CustomerServiceRecordBillingStatus;
  billing?: Record<string, unknown> | null;
  invoice_revision?: number;
  invoice?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
  created_by?: string | null;
  updated_by?: string | null;
}

const collectionName = 'customer_service_records';
const statuses = Object.values(CustomerServiceRecordBillingStatus);

function auditValue(record: HistoricalRecord): string {
  return JSON.stringify([
    record.createdAt,
    record.updatedAt,
    record.created_by,
    record.updated_by,
  ]);
}

function fieldsToSet(record: HistoricalRecord): Record<string, unknown> {
  const fields: Record<string, unknown> = {};
  const defaultBilling = {
    instructions: null,
    invoice_status:
      record.billing_status === CustomerServiceRecordBillingStatus.NOT_SUBMITTED
        ? null
        : CustomerServiceRecordInvoiceStatus.PENDING,
    issued_at: null,
    delivered_at: null,
    payment_term: null,
    estimated_payment_at: null,
    paid_at: null,
  };
  if (record.billing == null) {
    fields.billing = defaultBilling;
  } else {
    for (const [key, value] of Object.entries(defaultBilling)) {
      if (!Object.prototype.hasOwnProperty.call(record.billing, key)) {
        fields[`billing.${key}`] = value;
      }
    }
  }
  if (record.invoice_revision === undefined) fields.invoice_revision = 0;
  if (
    record.invoice &&
    !Object.prototype.hasOwnProperty.call(record.invoice, 'payment_complements')
  ) {
    fields['invoice.payment_complements'] = [];
  }
  return fields;
}

async function loadRecords(collection: Collection<HistoricalRecord>) {
  return collection
    .find(
      {},
      {
        projection: {
          billing_status: 1,
          billing: 1,
          invoice_revision: 1,
          invoice: 1,
          createdAt: 1,
          updatedAt: 1,
          created_by: 1,
          updated_by: 1,
        },
      },
    )
    .toArray();
}

async function bootstrap(): Promise<void> {
  const mode = parseMigrationMode(process.argv.slice(2));
  const logger = createMigrationLogger();
  const connection = await connectMigrationMongo(loadMigrationEnv());
  try {
    const collection =
      connection.db!.collection<HistoricalRecord>(collectionName);
    const records = await loadRecords(collection);
    const invalid = records.filter(
      (record) =>
        !record.billing_status || !statuses.includes(record.billing_status),
    );
    const pending = records.filter(
      (record) => Object.keys(fieldsToSet(record)).length > 0,
    );
    logger.info(`Mode: ${mode}`);
    logger.info(`Records total: ${records.length}`);
    logger.info(`Pending: ${pending.length}`);
    logger.info(
      `Initial PENDING: ${pending.filter((r) => r.billing == null && r.billing_status !== CustomerServiceRecordBillingStatus.NOT_SUBMITTED).length}`,
    );
    logger.info(
      `Initial null: ${pending.filter((r) => r.billing == null && r.billing_status === CustomerServiceRecordBillingStatus.NOT_SUBMITTED).length}`,
    );
    logger.info(`Invalid billing status: ${invalid.length}`);
    if (invalid.length)
      throw new Error('Invalid historical billing status found');
    if (mode === 'dry-run') {
      logger.info('Dry run finished without writes.');
      return;
    }
    const audit = new Map(
      records.map((record) => [String(record._id), auditValue(record)]),
    );
    let modified = 0;
    for (const record of pending) {
      const fields = fieldsToSet(record);
      const filter: Record<string, unknown> = { _id: record._id };
      if (record.billing === undefined) filter.billing = { $exists: false };
      else if (record.billing === null) filter.billing = null;
      if (record.invoice_revision === undefined)
        filter.invoice_revision = { $exists: false };
      const result = await collection.updateOne(filter, { $set: fields });
      modified += result.modifiedCount;
    }
    const after = await loadRecords(collection);
    const remaining = after.filter(
      (record) => Object.keys(fieldsToSet(record)).length > 0,
    );
    const auditUnchanged = after.every(
      (record) => audit.get(String(record._id)) === auditValue(record),
    );
    logger.info(`Records updated: ${modified}`);
    logger.info(`Pending after apply: ${remaining.length}`);
    logger.info(`Audit unchanged: ${auditUnchanged}`);
    if (remaining.length || !auditUnchanged || after.length !== records.length)
      throw new Error('Post-migration integrity check failed');
    logger.info('Result: SUCCESS');
  } finally {
    await connection.close();
    logger.info('MongoDB connection closed.');
  }
}

if (require.main === module) void bootstrap();
