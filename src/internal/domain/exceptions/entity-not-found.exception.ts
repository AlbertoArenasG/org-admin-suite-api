import { DomainException } from './domain.exception';

export enum EntityNotFoundExceptionCode {
  'User' = 'USER_NOT_FOUND',
  'UserRegistrationInvitation' = 'USER_REGISTRATION_INVITATION_NOT_FOUND',
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
