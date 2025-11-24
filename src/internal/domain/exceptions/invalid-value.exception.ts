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
  USER_REGISTRATION_INVITATION_TOKEN = 'VALIDATION.USER_REGISTRATION_INVITATION.TOKEN',
  USER_PASSWORD_RESET_TOKEN = 'VALIDATION.USER_PASSWORD_RESET.TOKEN',
  SERVICE_PACKAGE_ARCHIVE = 'VALIDATION.SERVICE_PACKAGE.ARCHIVE',
  SERVICE_PACKAGE_DETAILS = 'VALIDATION.SERVICE_PACKAGE.DETAILS',
}
