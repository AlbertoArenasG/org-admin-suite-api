import { DomainException } from './domain.exception';

export enum InvalidOperationExceptionCode {
  DEFAULT = 'INVALID_OPERATION',
}

export class InvalidOperationException extends DomainException {
  constructor(
    code: InvalidOperationExceptionCode = InvalidOperationExceptionCode.DEFAULT,
    details: Record<string, any> = {},
  ) {
    super(code, details);
  }

  static create(
    code = InvalidOperationExceptionCode.DEFAULT,
    details: Record<string, any> = {},
  ): InvalidOperationException {
    return new InvalidOperationException(code, details);
  }
}
