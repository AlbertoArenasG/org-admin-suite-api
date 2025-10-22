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
  TENANT_SLUG = 'ENTITY_ALREADY_EXISTS.TENANT.SLUG',
  TENANT_USER_EMAIL = 'ENTITY_ALREADY_EXISTS.TENANT.USER.EMAIL',
  USER_REGISTRATION_INVITATION_EMAIL = 'ENTITY_ALREADY_EXISTS.USER_REGISTRATION_INVITATION.EMAIL',
}
