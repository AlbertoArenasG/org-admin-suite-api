import {
  InvalidOperationException,
  InvalidOperationExceptionCodes,
} from '@domain/exceptions';

export class UserPasswordPolicy {
  static ensureSecure(password: string): void {
    const hasMinLength = password.length >= 6;

    if (!hasMinLength) {
      throw InvalidOperationException.create(
        InvalidOperationExceptionCodes.USER_PASSWORD_INVALID,
      );
    }
  }
}
