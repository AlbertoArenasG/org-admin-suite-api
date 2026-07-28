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
} as const;

export type AuthorizationOperationCode = keyof typeof AUTHORIZATION_OPERATIONS;
