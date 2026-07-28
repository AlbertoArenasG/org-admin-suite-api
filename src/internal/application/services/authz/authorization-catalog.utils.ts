import {
  AUTHORIZATION_OPERATIONS,
  AuthorizationOperationCode,
} from './authorization-operations.catalog';
import {
  AUTHORIZATION_CATALOG,
  AuthorizationModuleCode,
} from './authorization.catalog';

export interface AuthorizationModuleCatalogItem {
  code: AuthorizationModuleCode;
  nameKey: string;
  operations: AuthorizationOperationCode[];
}

export interface AuthorizationOperationCatalogItem {
  code: AuthorizationOperationCode;
  nameKey: string;
}

export function getAuthorizationModule(
  code: string,
): AuthorizationModuleCatalogItem | null {
  const normalizedCode = normalizeAuthorizationModuleCode(
    code,
  ) as AuthorizationModuleCode;
  const module = AUTHORIZATION_CATALOG[normalizedCode];

  if (!module) {
    return null;
  }

  return {
    code: module.code,
    nameKey: module.nameKey,
    operations: [...module.operations],
  };
}

export function getAuthorizationOperation(
  code: string,
): AuthorizationOperationCatalogItem | null {
  const normalizedCode = normalizeAuthorizationOperationCode(
    code,
  ) as AuthorizationOperationCode;
  const operation = AUTHORIZATION_OPERATIONS[normalizedCode];

  if (!operation) {
    return null;
  }

  return {
    code: operation.code,
    nameKey: operation.nameKey,
  };
}

export function normalizeAuthorizationModuleCode(code: string): string {
  return code.trim().replace(/\s+/g, '_').toUpperCase();
}

export function normalizeAuthorizationOperationCode(code: string): string {
  return code.trim().replace(/\s+/g, '_').toUpperCase();
}

export function getAuthorizationModules(): AuthorizationModuleCatalogItem[] {
  return Object.values(AUTHORIZATION_CATALOG).map((module) => ({
    code: module.code,
    nameKey: module.nameKey,
    operations: [...module.operations],
  }));
}

export function getAuthorizationOperations(): AuthorizationOperationCatalogItem[] {
  return Object.values(AUTHORIZATION_OPERATIONS).map((operation) => ({
    code: operation.code,
    nameKey: operation.nameKey,
  }));
}

export function isValidAuthorizationPermission(
  moduleCode: string,
  operationCode: string,
): boolean {
  const normalizedModule = normalizeAuthorizationModuleCode(
    moduleCode,
  ) as AuthorizationModuleCode;
  const normalizedOperation = normalizeAuthorizationOperationCode(
    operationCode,
  ) as AuthorizationOperationCode;

  const module = AUTHORIZATION_CATALOG[normalizedModule];

  if (!module) {
    return false;
  }

  return (module.operations as readonly string[]).includes(normalizedOperation);
}

export function normalizeAuthorizationPermission(input: {
  module: string;
  operation: string;
}): {
  module: AuthorizationModuleCode;
  operation: AuthorizationOperationCode;
} {
  return {
    module: normalizeAuthorizationModuleCode(
      input.module,
    ) as AuthorizationModuleCode,
    operation: normalizeAuthorizationOperationCode(
      input.operation,
    ) as AuthorizationOperationCode,
  };
}
