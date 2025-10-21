import { DomainException } from './domain.exception';

export enum AuthenticationExceptionCode {
  INVALID_CREDENTIALS = 'AUTHENTICATION.INVALID_CREDENTIALS',
  USER_INACTIVE = 'AUTHENTICATION.USER_INACTIVE',
  TOKEN_MISSING = 'AUTHENTICATION.TOKEN_MISSING',
  AUTHORIZATION_HEADER_INVALID = 'AUTHENTICATION.AUTHORIZATION_HEADER_INVALID',
  TOKEN_INVALID = 'AUTHENTICATION.TOKEN_INVALID',
  TOKEN_EXPIRED = 'AUTHENTICATION.TOKEN_EXPIRED',
  TOKEN_TYPE_UNRECOGNIZED = 'AUTHENTICATION.TOKEN_TYPE_UNRECOGNIZED',
  TOKEN_PAYLOAD_INVALID = 'AUTHENTICATION.TOKEN_PAYLOAD_INVALID',
  TOKEN_ROLE_INVALID = 'AUTHENTICATION.TOKEN_ROLE_INVALID',
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

  static tokenMissing(): AuthenticationException {
    return new AuthenticationException(
      AuthenticationExceptionCode.TOKEN_MISSING,
    );
  }

  static authorizationHeaderInvalid(
    details: Record<string, any> = {},
  ): AuthenticationException {
    return new AuthenticationException(
      AuthenticationExceptionCode.AUTHORIZATION_HEADER_INVALID,
      details,
    );
  }

  static tokenInvalid(
    details: Record<string, any> = {},
  ): AuthenticationException {
    return new AuthenticationException(
      AuthenticationExceptionCode.TOKEN_INVALID,
      details,
    );
  }

  static tokenExpired(): AuthenticationException {
    return new AuthenticationException(
      AuthenticationExceptionCode.TOKEN_EXPIRED,
    );
  }

  static tokenTypeUnrecognized(actualType: string): AuthenticationException {
    return new AuthenticationException(
      AuthenticationExceptionCode.TOKEN_TYPE_UNRECOGNIZED,
      { actualType },
    );
  }

  static tokenPayloadInvalid(
    details: Record<string, any> = {},
  ): AuthenticationException {
    return new AuthenticationException(
      AuthenticationExceptionCode.TOKEN_PAYLOAD_INVALID,
      details,
    );
  }

  static tokenRoleInvalid(role: string): AuthenticationException {
    return new AuthenticationException(
      AuthenticationExceptionCode.TOKEN_ROLE_INVALID,
      { role },
    );
  }
}
