import { Injectable } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';

import {
  InvalidValueException,
  InvalidValueExceptionCode,
} from '@domain/exceptions';
import { EnvService } from '@infra/env';

export interface GeneratedInvitationToken {
  token: string;
  tokenHash: string;
}

@Injectable()
export class UserRegistrationInvitationTokenService {
  constructor(private readonly envService: EnvService) {}

  generate(): GeneratedInvitationToken {
    const token = this.generateTokenValue(30);
    const tokenHash = this.hash(token);

    return { token, tokenHash };
  }

  hash(token: string): string {
    if (typeof token !== 'string') {
      throw InvalidValueException.create(
        InvalidValueExceptionCode.USER_REGISTRATION_INVITATION_TOKEN,
        { reason: 'Token must be a string' },
      );
    }

    const trimmed = token.trim();

    if (!trimmed) {
      throw InvalidValueException.create(
        InvalidValueExceptionCode.USER_REGISTRATION_INVITATION_TOKEN,
        { reason: 'Token must be a non-empty string' },
      );
    }

    return createHash('sha256').update(trimmed).digest('hex');
  }

  buildInvitationUrl(token: string): string {
    const baseUrl = this.envService.get(
      'USER_REGISTRATION_BASE_INVITATION_URL',
    );

    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}token=${token}`;
  }

  private generateTokenValue(length: number): string {
    let token = '';

    while (token.length < length) {
      token += randomBytes(24).toString('base64url');
    }

    return token.slice(0, length);
  }
}
