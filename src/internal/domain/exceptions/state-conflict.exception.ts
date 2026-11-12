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
  SERVICE_PACKAGE_RECORD_ALREADY_CONVERTED = 'STATE_CONFLICT.SERVICE_PACKAGE_RECORD.ALREADY_CONVERTED',
  SERVICE_PACKAGE_RECORD_NOT_ACTIVE = 'STATE_CONFLICT.SERVICE_PACKAGE_RECORD.NOT_ACTIVE',
  CUSTOMER_SERVICE_RECORD_BILLING_STATUS_CHANGED = 'STATE_CONFLICT.CUSTOMER_SERVICE_RECORD.BILLING_STATUS_CHANGED',
  CUSTOMER_SERVICE_RECORD_INVOICE_CHANGED = 'STATE_CONFLICT.CUSTOMER_SERVICE_RECORD.INVOICE_CHANGED',
  USER_CUSTOMER_RELATIONSHIP_ALREADY_EXISTS = 'STATE_CONFLICT.USER_CUSTOMER_RELATIONSHIP.ALREADY_EXISTS',
  USER_CUSTOMER_RELATIONSHIP_NOT_FOUND = 'STATE_CONFLICT.USER_CUSTOMER_RELATIONSHIP.NOT_FOUND',
}
