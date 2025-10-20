import { DomainException } from './domain.exception';

export enum AuthenticationExceptionCode {
  INVALID_CREDENTIALS = 'AUTHENTICATION.INVALID_CREDENTIALS',
  USER_INACTIVE = 'AUTHENTICATION.USER_INACTIVE',
}

export class AuthenticationException extends DomainException {
  private constructor(
    code: AuthenticationExceptionCode,
    details: Record<string, any> = {},
  ) {
    super(code, details);
  }

  static invalidCredentials(): AuthenticationException {
    return new AuthenticationException(
      AuthenticationExceptionCode.INVALID_CREDENTIALS,
    );
  }

  static userInactive(status: string): AuthenticationException {
    return new AuthenticationException(
      AuthenticationExceptionCode.USER_INACTIVE,
      { status },
    );
  }
}
