import { AuthorizationOperationCode } from './authorization-operations.catalog';

export const AUTHORIZATION_CATALOG = {
  USERS: {
    code: 'USERS',
    nameKey: 'AUTHORIZATION.MODULE.USERS',
    operations: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
  },
  ROLES: {
    code: 'ROLES',
    nameKey: 'AUTHORIZATION.MODULE.ROLES',
    operations: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
  },
  CUSTOMERS: {
    code: 'CUSTOMERS',
    nameKey: 'AUTHORIZATION.MODULE.CUSTOMERS',
    operations: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
  },
  PROVIDERS: {
    code: 'PROVIDERS',
    nameKey: 'AUTHORIZATION.MODULE.PROVIDERS',
    operations: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
  },
  SERVICE_ENTRIES: {
    code: 'SERVICE_ENTRIES',
    nameKey: 'AUTHORIZATION.MODULE.SERVICE_ENTRIES',
    operations: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
  },
  SERVICE_ENTRY_SURVEYS: {
    code: 'SERVICE_ENTRY_SURVEYS',
    nameKey: 'AUTHORIZATION.MODULE.SERVICE_ENTRY_SURVEYS',
    operations: ['READ'],
  },
  SERVICE_PACKAGES: {
    code: 'SERVICE_PACKAGES',
    nameKey: 'AUTHORIZATION.MODULE.SERVICE_PACKAGES',
    operations: ['READ', 'DELETE'],
  },
  USER_REGISTRATION_INVITATIONS: {
    code: 'USER_REGISTRATION_INVITATIONS',
    nameKey: 'AUTHORIZATION.MODULE.USER_REGISTRATION_INVITATIONS',
    operations: ['CREATE'],
  },
} as const satisfies Record<
  string,
  {
    code: string;
    nameKey: string;
    operations: AuthorizationOperationCode[];
  }
>;

export type AuthorizationModuleCode = keyof typeof AUTHORIZATION_CATALOG;
