import { Injectable } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';

import {
  InvalidValueException,
  InvalidValueExceptionCode,
} from '@domain/exceptions';
import { EnvService } from '@infra/env';

export interface GeneratedUserPasswordResetToken {
  token: string;
  tokenHash: string;
  requestedAt: Date;
  expiresAt: Date;
}

@Injectable()
export class UserPasswordResetTokenService {
  private static readonly TOKEN_LENGTH = 48;
  private static readonly EXPIRATION_MINUTES = 60;

  constructor(private readonly envService: EnvService) {}

  generate(): GeneratedUserPasswordResetToken {
    const token = this.generateTokenValue(
      UserPasswordResetTokenService.TOKEN_LENGTH,
    );
    const tokenHash = this.hash(token);
    const requestedAt = new Date();
    const expiresAt = new Date(
      requestedAt.getTime() +
        UserPasswordResetTokenService.EXPIRATION_MINUTES * 60 * 1000,
    );

    return { token, tokenHash, requestedAt, expiresAt };
  }

  hash(token: string): string {
    if (typeof token !== 'string') {
      throw InvalidValueException.create(
        InvalidValueExceptionCode.USER_PASSWORD_RESET_TOKEN,
        { reason: 'Token must be a string' },
      );
    }

    const trimmed = token.trim();

    if (!trimmed) {
      throw InvalidValueException.create(
        InvalidValueExceptionCode.USER_PASSWORD_RESET_TOKEN,
        { reason: 'Token must be a non-empty string' },
      );
    }

    return createHash('sha256').update(trimmed).digest('hex');
  }

  buildResetUrl(token: string): string {
    const baseUrl = this.envService.get('USER_PASSWORD_RESET_URL');
    const separator = baseUrl.includes('?') ? '&' : '?';

    return `${baseUrl}${separator}token=${encodeURIComponent(token)}`;
  }

  private generateTokenValue(length: number): string {
    let token = '';

    while (token.length < length) {
      token += randomBytes(24).toString('base64url');
    }

    return token.slice(0, length);
  }
}
