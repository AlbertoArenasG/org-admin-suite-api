import mongoose from 'mongoose';

import {
  connectMigrationMongo,
  createMigrationLogger,
  loadMigrationEnv,
  parseMigrationMode,
} from './shared/mongoose-migration.utils';

async function main(): Promise<void> {
  const logger = createMigrationLogger();
  const mode = parseMigrationMode(process.argv.slice(2));
  const connection = await connectMigrationMongo(loadMigrationEnv());
  try {
    const sources = connection.collection('service_package_records');
    const targets = connection.collection('customer_service_records');
    const sourceFilter = {
      converted_to_customer_service_records: { $exists: false },
    };
    const targetIdFilter = {
      source_service_package_record_id: { $exists: false },
    };
    const targetOrderFilter = { source_service_order: { $exists: false } };
    const [sourceCount, targetIdCount, targetOrderCount] = await Promise.all([
      sources.countDocuments(sourceFilter),
      targets.countDocuments(targetIdFilter),
      targets.countDocuments(targetOrderFilter),
    ]);
    logger.info(`Mode: ${mode}`);
    logger.info(`Source records pending: ${sourceCount}`);
    logger.info(`Target source IDs pending: ${targetIdCount}`);
    logger.info(`Target service orders pending: ${targetOrderCount}`);
    if (mode === 'dry-run') return;

    // Native updates intentionally omit all audit fields and Mongoose timestamps.
    const sourceResult = await sources.updateMany(sourceFilter, {
      $set: { converted_to_customer_service_records: false },
    });
    const targetIdResult = await targets.updateMany(targetIdFilter, {
      $set: { source_service_package_record_id: null },
    });
    const targetOrderResult = await targets.updateMany(targetOrderFilter, {
      $set: { source_service_order: null },
    });
    logger.info(`Source records updated: ${sourceResult.modifiedCount}`);
    logger.info(`Target source IDs updated: ${targetIdResult.modifiedCount}`);
    logger.info(
      `Target service orders updated: ${targetOrderResult.modifiedCount}`,
    );
    const remaining = await Promise.all([
      sources.countDocuments(sourceFilter),
      targets.countDocuments(targetIdFilter),
      targets.countDocuments(targetOrderFilter),
    ]);
    if (remaining.some((count) => count !== 0)) {
      throw new Error(`Migration incomplete: ${remaining.join(', ')}`);
    }
    logger.info('Result: SUCCESS');
  } finally {
    await mongoose.disconnect();
    logger.info('MongoDB connection closed.');
  }
}

void main().catch((error) => {
  console.error('[db:migrate] Migration failed', error);
  process.exitCode = 1;
});
