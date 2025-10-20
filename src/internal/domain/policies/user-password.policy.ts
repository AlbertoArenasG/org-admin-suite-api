import {
  InvalidValueException,
  InvalidValueExceptionCode,
} from '@domain/exceptions';

export class UserPasswordPolicy {
  static ensureSecure(password: string): void {
    const hasMinLength = password.length >= 6;

    if (!hasMinLength) {
      throw InvalidValueException.create(
        InvalidValueExceptionCode.USER_PASSWORD,
      );
    }
  }
}
