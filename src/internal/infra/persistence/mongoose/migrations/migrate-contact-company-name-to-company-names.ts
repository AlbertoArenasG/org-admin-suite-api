import {
  AnyBulkWriteOperation,
  Collection,
  Document,
  IndexDescriptionInfo,
} from 'mongodb';

import {
  connectMigrationMongo,
  createMigrationContext,
  createMigrationLogger,
  loadMigrationEnv,
  parseMigrationMode,
} from './shared/mongoose-migration.utils';
import { MongooseMigrationContext } from './shared/mongoose-migration.types';

const MIGRATION_NAME = 'migrate-contact-company-name-to-company-names';
const CONTACTS_COLLECTION = 'contacts';
const CONTACT_TEXT_INDEX_NAME = 'full_name_text_company_names_text';

interface ContactMigrationPlan {
  totalContacts: number;
  contactsWithLegacyCompanyName: number;
  contactsPendingNormalization: number;
  alreadyCanonical: number;
  legacyTextIndexes: string[];
  hasCanonicalTextIndex: boolean;
}

interface ContactMigrationApplySummary {
  updatedContacts: number;
  droppedLegacyTextIndexes: number;
  createdCanonicalTextIndex: boolean;
}

interface ContactMigrationIntegritySummary {
  contactsWithLegacyCompanyName: number;
  contactsWithInvalidCompanyNames: number;
  legacyTextIndexes: string[];
  hasCanonicalTextIndex: boolean;
  integrityOk: boolean;
}

interface HistoricalContact extends Document {
  company_name?: unknown;
  company_names?: unknown;
}

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
    const contacts =
      connection.db!.collection<HistoricalContact>(CONTACTS_COLLECTION);

    logger.info(`Running "${MIGRATION_NAME}" in mode=${mode}.`);

    const plan = await buildPlan(contacts);
    printPlan(context, plan);

    if (mode === 'dry-run') {
      logger.info('Dry run finished without writes.');
      return;
    }

    const apply = await applyMigration(contacts, plan);
    const integrity = await verifyIntegrity(contacts);
    printApply(context, apply, integrity);

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
  contacts: Collection<HistoricalContact>,
): Promise<ContactMigrationPlan> {
  const documents = await contacts
    .find({}, { projection: { company_name: 1, company_names: 1 } })
    .toArray();
  const indexes = await contacts.indexes();
  let contactsWithLegacyCompanyName = 0;
  let contactsPendingNormalization = 0;

  for (const contact of documents) {
    const hasLegacyCompanyName = hasOwn(contact, 'company_name');
    if (hasLegacyCompanyName) {
      contactsWithLegacyCompanyName += 1;
    }

    const normalizedCompanyNames = normalizeCompanyNames(
      contact.company_names,
      contact.company_name,
    );
    if (
      hasLegacyCompanyName ||
      !hasCanonicalCompanyNames(contact.company_names, normalizedCompanyNames)
    ) {
      contactsPendingNormalization += 1;
    }
  }

  const legacyTextIndexes = indexes
    .filter(isLegacyTextIndex)
    .flatMap((index) => (index.name ? [index.name] : []));

  return {
    totalContacts: documents.length,
    contactsWithLegacyCompanyName,
    contactsPendingNormalization,
    alreadyCanonical: documents.length - contactsPendingNormalization,
    legacyTextIndexes,
    hasCanonicalTextIndex: indexes.some(isCanonicalTextIndex),
  };
}

async function applyMigration(
  contacts: Collection<HistoricalContact>,
  plan: ContactMigrationPlan,
): Promise<ContactMigrationApplySummary> {
  const documents = await contacts
    .find({}, { projection: { company_name: 1, company_names: 1 } })
    .toArray();
  const operations: AnyBulkWriteOperation<HistoricalContact>[] = [];

  for (const contact of documents) {
    const normalizedCompanyNames = normalizeCompanyNames(
      contact.company_names,
      contact.company_name,
    );
    const hasLegacyCompanyName = hasOwn(contact, 'company_name');

    if (
      !hasLegacyCompanyName &&
      hasCanonicalCompanyNames(contact.company_names, normalizedCompanyNames)
    ) {
      continue;
    }

    operations.push({
      updateOne: {
        filter: { _id: contact._id },
        update: {
          $set: { company_names: normalizedCompanyNames },
          $unset: { company_name: '' },
        },
      },
    });
  }

  if (operations.length > 0) {
    await contacts.bulkWrite(operations, { ordered: true });
  }

  for (const indexName of plan.legacyTextIndexes) {
    await contacts.dropIndex(indexName);
  }

  const indexes = await contacts.indexes();
  let createdCanonicalTextIndex = false;
  if (!indexes.some(isCanonicalTextIndex)) {
    await contacts.createIndex(
      { full_name: 'text', company_names: 'text' },
      { name: CONTACT_TEXT_INDEX_NAME },
    );
    createdCanonicalTextIndex = true;
  }

  return {
    updatedContacts: operations.length,
    droppedLegacyTextIndexes: plan.legacyTextIndexes.length,
    createdCanonicalTextIndex,
  };
}

async function verifyIntegrity(
  contacts: Collection<HistoricalContact>,
): Promise<ContactMigrationIntegritySummary> {
  const documents = await contacts
    .find({}, { projection: { company_name: 1, company_names: 1 } })
    .toArray();
  const indexes = await contacts.indexes();
  const contactsWithLegacyCompanyName = documents.filter((contact) =>
    hasOwn(contact, 'company_name'),
  ).length;
  const contactsWithInvalidCompanyNames = documents.filter((contact) => {
    const normalized = normalizeCompanyNames(contact.company_names);
    return !hasCanonicalCompanyNames(contact.company_names, normalized);
  }).length;
  const legacyTextIndexes = indexes
    .filter(isLegacyTextIndex)
    .flatMap((index) => (index.name ? [index.name] : []));
  const hasCanonicalTextIndex = indexes.some(isCanonicalTextIndex);

  return {
    contactsWithLegacyCompanyName,
    contactsWithInvalidCompanyNames,
    legacyTextIndexes,
    hasCanonicalTextIndex,
    integrityOk:
      contactsWithLegacyCompanyName === 0 &&
      contactsWithInvalidCompanyNames === 0 &&
      legacyTextIndexes.length === 0 &&
      hasCanonicalTextIndex,
  };
}

function normalizeCompanyNames(
  companyNames: unknown,
  legacyCompanyName?: unknown,
): string[] {
  const values = [
    ...(Array.isArray(companyNames) ? companyNames : []),
    legacyCompanyName,
  ];
  const seen = new Set<string>();

  return values.reduce<string[]>((normalized, value) => {
    if (typeof value !== 'string') {
      return normalized;
    }

    const companyName = value.trim();
    if (!companyName || seen.has(companyName)) {
      return normalized;
    }

    seen.add(companyName);
    normalized.push(companyName);
    return normalized;
  }, []);
}

function hasCanonicalCompanyNames(
  companyNames: unknown,
  normalizedCompanyNames: string[],
): boolean {
  return (
    Array.isArray(companyNames) &&
    companyNames.length === normalizedCompanyNames.length &&
    companyNames.every(
      (companyName, index) => companyName === normalizedCompanyNames[index],
    )
  );
}

function isLegacyTextIndex(index: IndexDescriptionInfo): boolean {
  return Boolean(index.weights && hasOwn(index.weights, 'company_name'));
}

function isCanonicalTextIndex(index: IndexDescriptionInfo): boolean {
  return Boolean(
    index.weights &&
      hasOwn(index.weights, 'full_name') &&
      hasOwn(index.weights, 'company_names'),
  );
}

function hasOwn(value: object, property: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, property);
}

function printPlan(
  context: MongooseMigrationContext,
  plan: ContactMigrationPlan,
) {
  context.logger.info(
    `Plan: total=${plan.totalContacts} legacy_company_name=${plan.contactsWithLegacyCompanyName} pending=${plan.contactsPendingNormalization} already_canonical=${plan.alreadyCanonical}.`,
  );
  context.logger.info(
    `Indexes: legacy=${plan.legacyTextIndexes.length > 0 ? plan.legacyTextIndexes.join(', ') : 'none'} canonical=${plan.hasCanonicalTextIndex}.`,
  );
}

function printApply(
  context: MongooseMigrationContext,
  apply: ContactMigrationApplySummary,
  integrity: ContactMigrationIntegritySummary,
) {
  context.logger.info(
    `Applied: contacts_updated=${apply.updatedContacts} legacy_indexes_dropped=${apply.droppedLegacyTextIndexes} canonical_index_created=${apply.createdCanonicalTextIndex}.`,
  );
  context.logger.info(
    `Integrity: legacy_company_name=${integrity.contactsWithLegacyCompanyName} invalid_company_names=${integrity.contactsWithInvalidCompanyNames} legacy_indexes=${integrity.legacyTextIndexes.length} canonical_index=${integrity.hasCanonicalTextIndex}.`,
  );
}

void bootstrap();
