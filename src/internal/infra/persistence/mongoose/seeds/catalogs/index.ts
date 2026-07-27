import { MongooseSeedDefinition } from '../shared/mongoose-seed.types';
import { permissionModulesSeed } from './permission-modules.seed';
import { permissionOperationsSeed } from './permission-operations.seed';

export const catalogSeeds: MongooseSeedDefinition[] = [
  permissionModulesSeed,
  permissionOperationsSeed,
];
