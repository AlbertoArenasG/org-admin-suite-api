import { DomainException } from './domain.exception';
import { HttpStatus } from '@nestjs/common';

export enum InvalidOperationExceptionCodes {
  USER_PASSWORD_INVALID = 'errors.invalidOperation.user_password_invalid',
}

export class InvalidOperationException extends DomainException {
  constructor(code: InvalidOperationExceptionCodes) {
    const errorCode = code || 'errors.invalidOperation.default';
    super(errorCode, HttpStatus.BAD_REQUEST);
  }

  static create(code: InvalidOperationExceptionCodes) {
    return new InvalidOperationException(code);
  }
}
