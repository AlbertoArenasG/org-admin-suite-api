import { MongooseSeedDefinition } from '../shared/mongoose-seed.types';
import { contactsFromUsersSeed } from './contacts-from-users.seed';

export const catalogSeeds: MongooseSeedDefinition[] = [contactsFromUsersSeed];
