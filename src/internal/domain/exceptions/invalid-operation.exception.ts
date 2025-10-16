export class InvalidOperationException extends Error {
  readonly name = 'InvalidOperationException';

  constructor(
    message: string,
    public readonly code = 'DOMAIN_INVALID_OPERATION',
  ) {
    super(message);
    Error.captureStackTrace?.(this, InvalidOperationException);
  }
}
