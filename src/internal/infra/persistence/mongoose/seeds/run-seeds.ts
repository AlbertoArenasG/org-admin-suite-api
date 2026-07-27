import { catalogSeeds } from './catalogs';
import { roleSeeds } from './roles';
import { runMongooseSeeds } from './shared/mongoose-seed.runner';

async function bootstrap() {
  const seeds = [...catalogSeeds, ...roleSeeds];

  if (seeds.length === 0) {
    console.info('[db:seed] No registered seeds found.');
    return;
  }

  await runMongooseSeeds(seeds);
}

void bootstrap().catch((error: unknown) => {
  console.error('[db:seed] Seed execution failed.', error);
  process.exitCode = 1;
});
