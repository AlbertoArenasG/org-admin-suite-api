import {
  InvalidValueException,
  InvalidValueExceptionCode,
} from '@domain/exceptions';

export class UserPasswordPolicy {
  static MIN_PASSWORD_LENGTH = 6;

  static ensureSecure(password: string): void {
    const hasMinLength = password.length >= this.MIN_PASSWORD_LENGTH;

    if (!hasMinLength) {
      throw InvalidValueException.create(
        InvalidValueExceptionCode.USER_PASSWORD,
      );
    }
  }
}
