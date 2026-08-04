export const AUTHORIZATION_OPERATIONS = {
  CREATE: {
    code: 'CREATE',
    nameKey: 'AUTHORIZATION.OPERATION.CREATE',
  },
  READ: {
    code: 'READ',
    nameKey: 'AUTHORIZATION.OPERATION.READ',
  },
  UPDATE: {
    code: 'UPDATE',
    nameKey: 'AUTHORIZATION.OPERATION.UPDATE',
  },
  DELETE: {
    code: 'DELETE',
    nameKey: 'AUTHORIZATION.OPERATION.DELETE',
  },
  READ_PUBLIC_ACCESS: {
    code: 'READ_PUBLIC_ACCESS',
    nameKey: 'AUTHORIZATION.OPERATION.READ_PUBLIC_ACCESS',
  },
} as const;

export type AuthorizationOperationCode = keyof typeof AUTHORIZATION_OPERATIONS;
