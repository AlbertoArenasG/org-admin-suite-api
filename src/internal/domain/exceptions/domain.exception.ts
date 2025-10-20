export abstract class DomainException extends Error {
  constructor(
    public readonly code: string,
    public readonly details?: Record<string, any>,
  ) {
    super(code);
  }
}

export enum ExceptionCode {
  INVALID_EMAIL = 'INVALID_EMAIL',
  USER_PASSWORD_INVALID = 'USER_PASSWORD_INVALID',
  INVALID_PHONE_NUMBER = 'INVALID_PHONE_NUMBER',
}
