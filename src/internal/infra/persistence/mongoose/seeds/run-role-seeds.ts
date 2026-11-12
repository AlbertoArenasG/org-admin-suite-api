import { roleSeeds } from './roles';
import { runMongooseSeeds } from './shared/mongoose-seed.runner';

async function bootstrap() {
  const args = process.argv.slice(2);
  if (args.some((arg) => arg !== '--dry-run') || args.length > 1) {
    throw new Error('Only --dry-run is supported; omit it to apply the seed.');
  }
  await runMongooseSeeds(roleSeeds, { dryRun: args.includes('--dry-run') });
}

void bootstrap().catch((error: unknown) => {
  console.error('[db:seed:roles] Seed execution failed.', error);
  process.exitCode = 1;
});
