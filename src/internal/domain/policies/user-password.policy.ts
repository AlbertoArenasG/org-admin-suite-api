import { InvalidOperationException } from '@domain/exceptions';

export class UserPasswordPolicy {
  static ensureSecure(password: string): void {
    const hasMinLength = password.length >= 6;

    if (!hasMinLength) {
      throw new InvalidOperationException(
        'Password does not meet security policy',
      );
    }
  }
}
