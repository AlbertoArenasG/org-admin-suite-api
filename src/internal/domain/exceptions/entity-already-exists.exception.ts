import { DomainException } from './domain.exception';

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

export enum EntityAlreadyExistsExceptionCode {
  USER_EMAIL = 'ENTITY_ALREADY_EXISTS.USER.EMAIL',
  USER_REGISTRATION_INVITATION_EMAIL = 'ENTITY_ALREADY_EXISTS.USER_REGISTRATION_INVITATION.EMAIL',
  SERVICE_ENTRY_ORDER = 'ENTITY_ALREADY_EXISTS.SERVICE_ENTRY.ORDER',
}
