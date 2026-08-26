import { DomainException } from './domain.exception';

export class StateConflictException extends DomainException {
  constructor(
    code: StateConflictExceptionCode,
    details: Record<string, any> = {},
  ) {
    super(code, details);
  }

  static create(
    code: StateConflictExceptionCode,
    details: Record<string, any> = {},
  ): StateConflictException {
    return new StateConflictException(code, details);
  }
}

export enum StateConflictExceptionCode {
  USER_CUSTOMER_RELATIONSHIP_ALREADY_EXISTS = 'STATE_CONFLICT.USER_CUSTOMER_RELATIONSHIP.ALREADY_EXISTS',
  USER_CUSTOMER_RELATIONSHIP_NOT_FOUND = 'STATE_CONFLICT.USER_CUSTOMER_RELATIONSHIP.NOT_FOUND',
}
