import { DomainException } from './domain.exception';
import { HttpStatus } from '@nestjs/common';

export enum EntityAlreadyExistsExceptionCodes {
  USER = 'errors.conflict.user',
}

export class EntityAlreadyExistsException extends DomainException {
  constructor(code: EntityAlreadyExistsExceptionCodes) {
    const errorCode = code || 'errors.conflict.default';
    super(errorCode, HttpStatus.CONFLICT);
  }

  static create(code: EntityAlreadyExistsExceptionCodes) {
    return new EntityAlreadyExistsException(code);
  }
}
