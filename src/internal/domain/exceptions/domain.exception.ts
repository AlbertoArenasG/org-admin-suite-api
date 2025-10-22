export abstract class DomainException extends Error {
  constructor(
    public readonly code: string,
    public readonly details?: Record<string, any>,
  ) {
    super(code);
  }
}
