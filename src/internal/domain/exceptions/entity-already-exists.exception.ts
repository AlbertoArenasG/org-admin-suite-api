import { DomainException } from './domain.exception';

export enum EntityAlreadyExistsExceptionCode {
  USER = 'errors.conflict.user',
}

export class EntityAlreadyExistsException extends DomainException {
  constructor(
    code: EntityAlreadyExistsExceptionCode,
    details: Record<string, any> = {},
  ) {
    super(code, details);
  }

  static create(
    code: EntityAlreadyExistsExceptionCode,
    details: Record<string, any> = {},
  ): EntityAlreadyExistsException {
    return new EntityAlreadyExistsException(code, details);
  }
}
