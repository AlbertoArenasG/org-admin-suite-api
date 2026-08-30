import { contactsFromUsersSeed } from './catalogs/contacts-from-users.seed';
import { runMongooseSeeds } from './shared/mongoose-seed.runner';

void runMongooseSeeds([contactsFromUsersSeed]).catch((error: unknown) => {
  console.error('[db:seed:contacts-from-users] Seed execution failed.', error);
  process.exitCode = 1;
});
