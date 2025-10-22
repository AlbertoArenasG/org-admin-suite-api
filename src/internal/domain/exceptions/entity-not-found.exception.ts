import { DomainException } from './domain.exception';

export enum EntityNotFoundExceptionCode {
  USER = 'ENTITY_NOT_FOUND.USER',
  USER_REGISTRATION_INVITATION = 'ENTITY_NOT_FOUND.USER_REGISTRATION_INVITATION',
}

export class EntityNotFoundException extends DomainException {
  constructor(
    code: EntityNotFoundExceptionCode,
    details: Record<string, any> = {} as Record<string, any>,
  ) {
    super(code, details);
  }

  static create(
    code: EntityNotFoundExceptionCode,
    details: Record<string, any> = {},
  ) {
    return new EntityNotFoundException(code, details);
  }
}
