import { customerServiceRecordServiceTypesSeed } from './catalogs/customer-service-record-service-types.seed';
import { runMongooseSeeds } from './shared/mongoose-seed.runner';

void runMongooseSeeds([customerServiceRecordServiceTypesSeed]).catch(
  (error: unknown) => {
    console.error(
      '[db:seed:customer-service-record-service-types] Seed execution failed.',
      error,
    );
    process.exitCode = 1;
  },
);
