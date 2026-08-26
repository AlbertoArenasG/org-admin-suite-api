import { roleSeeds } from './roles';
import { runMongooseSeeds } from './shared/mongoose-seed.runner';

async function bootstrap() {
  await runMongooseSeeds(roleSeeds);
}

void bootstrap().catch((error: unknown) => {
  console.error('[db:seed:roles] Seed execution failed.', error);
  process.exitCode = 1;
});
