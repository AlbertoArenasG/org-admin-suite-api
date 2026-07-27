import { MongooseSeedDefinition } from '../shared/mongoose-seed.types';
import { systemRolesSeed } from './system-roles.seed';

export const roleSeeds: MongooseSeedDefinition[] = [systemRolesSeed];
