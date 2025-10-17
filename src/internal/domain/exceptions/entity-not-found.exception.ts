import { DomainException } from './domain.exception';
import { HttpStatus } from '@nestjs/common';

export enum EntityNotFoundExceptionCodes {
  USER = 'errors.entityNotFound.user',
}

export class EntityNotFoundException extends DomainException {
  constructor(code: EntityNotFoundExceptionCodes) {
    const errorCode = code || 'errors.entityNotFound.default';
    super(errorCode, HttpStatus.NOT_FOUND);
  }

  static create(code: EntityNotFoundExceptionCodes) {
    return new EntityNotFoundException(code);
  }
}
