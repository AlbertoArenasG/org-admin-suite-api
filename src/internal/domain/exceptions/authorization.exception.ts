import { DomainException } from './domain.exception';

export enum AuthorizationExceptionCode {
  CONTEXT_MISSING = 'AUTHORIZATION.CONTEXT_MISSING',
  MASTER_PRIVILEGES_REQUIRED = 'AUTHORIZATION.MASTER_PRIVILEGES_REQUIRED',
  TENANT_IDENTIFIER_REQUIRED = 'AUTHORIZATION.TENANT_IDENTIFIER_REQUIRED',
  TENANT_ACCESS_FORBIDDEN = 'AUTHORIZATION.TENANT_ACCESS_FORBIDDEN',
  TENANT_MISMATCH = 'AUTHORIZATION.TENANT_MISMATCH',
  TENANT_PRIVILEGES_INSUFFICIENT = 'AUTHORIZATION.TENANT_PRIVILEGES_INSUFFICIENT',
}

export class AuthorizationException extends DomainException {
  private constructor(
    code: AuthorizationExceptionCode,
    details: Record<string, any> = {},
  ) {
    super(code, details);
  }

  static authContextMissing(): AuthorizationException {
    return new AuthorizationException(
      AuthorizationExceptionCode.CONTEXT_MISSING,
    );
  }

  static masterPrivilegesRequired(): AuthorizationException {
    return new AuthorizationException(
      AuthorizationExceptionCode.MASTER_PRIVILEGES_REQUIRED,
    );
  }

  static tenantIdentifierRequired(): AuthorizationException {
    return new AuthorizationException(
      AuthorizationExceptionCode.TENANT_IDENTIFIER_REQUIRED,
    );
  }

  static tenantAccessForbidden(
    details: Record<string, any> = {},
  ): AuthorizationException {
    return new AuthorizationException(
      AuthorizationExceptionCode.TENANT_ACCESS_FORBIDDEN,
      details,
    );
  }

  static tenantMismatch(
    expected: string,
    actual: string,
  ): AuthorizationException {
    return new AuthorizationException(
      AuthorizationExceptionCode.TENANT_MISMATCH,
      { expected, actual },
    );
  }

  static tenantPrivilegesInsufficient(role: string): AuthorizationException {
    return new AuthorizationException(
      AuthorizationExceptionCode.TENANT_PRIVILEGES_INSUFFICIENT,
      { role },
    );
  }
}
