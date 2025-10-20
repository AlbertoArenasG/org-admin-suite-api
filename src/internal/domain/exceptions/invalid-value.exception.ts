import { DomainException } from './domain.exception';

export class InvalidValueException extends DomainException {
  constructor(
    code: InvalidValueExceptionCode = InvalidValueExceptionCode.DEFAULT,
    details: Record<string, any> = {},
  ) {
    super(code, details);
  }

  static create(
    code = InvalidValueExceptionCode.DEFAULT,
    details: Record<string, any> = {},
  ): InvalidValueException {
    return new InvalidValueException(code, details);
  }
}

export enum InvalidValueExceptionCode {
  DEFAULT = 'VALIDATION.DEFAULT',
  USER_PASSWORD = 'VALIDATION.USER.PASSWORD',
  PHONE = 'VALIDATION.PHONE',
}
