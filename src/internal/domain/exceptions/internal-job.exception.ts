import { DomainException } from './domain.exception';

export enum InternalJobExceptionCode {
  LOCK_ACTIVE = 'INTERNAL_JOB.LOCK_ACTIVE',
}

export class InternalJobException extends DomainException {
  private constructor(
    code: InternalJobExceptionCode,
    details: Record<string, unknown> = {},
  ) {
    super(code, details);
  }

  static lockActive(lockedUntil: Date): InternalJobException {
    return new InternalJobException(InternalJobExceptionCode.LOCK_ACTIVE, {
      lockedUntil,
    });
  }
}
