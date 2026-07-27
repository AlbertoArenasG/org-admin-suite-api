import { MongooseSeedDefinition, SeedReportItem } from './mongoose-seed.types';
import {
  connectSeedMongo,
  createSeedContext,
  createSeedLogger,
  formatSeedReportItem,
  loadSeedEnv,
} from './mongoose-seed.utils';

export async function runMongooseSeeds(
  seeds: MongooseSeedDefinition[],
): Promise<SeedReportItem[]> {
  const env = loadSeedEnv();
  const logger = createSeedLogger();
  const connection = await connectSeedMongo(env);
  const reports: SeedReportItem[] = [];

  try {
    logger.info(`Connected to MongoDB. Registered seeds: ${seeds.length}.`);

    const context = createSeedContext({
      connection,
      env,
      logger,
    });

    for (const seed of seeds) {
      logger.info(`Running seed "${seed.name}".`);

      const report = await seed.run(context);
      reports.push(report);

      logger.info(formatSeedReportItem(report));
    }

    logger.info('Seed execution finished.');

    return reports;
  } finally {
    await connection.close();
    logger.info('MongoDB connection closed.');
  }
}
