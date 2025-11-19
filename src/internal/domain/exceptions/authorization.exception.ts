import { DomainException } from './domain.exception';

export enum AuthorizationExceptionCode {
  CONTEXT_MISSING = 'AUTHORIZATION.CONTEXT_MISSING',
  MASTER_PRIVILEGES_REQUIRED = 'AUTHORIZATION.MASTER_PRIVILEGES_REQUIRED',
  ROLE_PRIVILEGES_INSUFFICIENT = 'AUTHORIZATION.ROLE_PRIVILEGES_INSUFFICIENT',
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

  static rolePrivilegesInsufficient(role: string): AuthorizationException {
    return new AuthorizationException(
      AuthorizationExceptionCode.ROLE_PRIVILEGES_INSUFFICIENT,
      { role },
    );
  }
}
