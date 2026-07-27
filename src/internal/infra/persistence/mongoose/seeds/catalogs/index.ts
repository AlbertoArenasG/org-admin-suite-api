import { MongooseSeedDefinition } from '../shared/mongoose-seed.types';
import { permissionOperationsSeed } from './permission-operations.seed';

export const catalogSeeds: MongooseSeedDefinition[] = [
  permissionOperationsSeed,
];
