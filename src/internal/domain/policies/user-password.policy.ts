import {
  InvalidOperationException,
  InvalidOperationExceptionCode,
} from '@domain/exceptions';

export class UserPasswordPolicy {
  static ensureSecure(password: string): void {
    const hasMinLength = password.length >= 6;

    if (!hasMinLength) {
      throw InvalidOperationException.create(
        InvalidOperationExceptionCode.DEFAULT,
      );
    }
  }
}
