import { MongooseSeedDefinition } from '../shared/mongoose-seed.types';
import { legacyStaffRoleSeed } from './legacy-staff-role.seed';
import { systemRolesSeed } from './system-roles.seed';

export const roleSeeds: MongooseSeedDefinition[] = [
  systemRolesSeed,
  legacyStaffRoleSeed,
];
