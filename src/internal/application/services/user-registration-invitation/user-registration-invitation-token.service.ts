import { createHash, randomBytes } from 'crypto';

import {
  InvalidValueException,
  InvalidValueExceptionCode,
} from '@domain/exceptions';

const DEFAULT_INVITATION_URL_TEMPLATE =
  'https://example.com/register?token={{token}}';

export interface GeneratedInvitationToken {
  token: string;
  tokenHash: string;
}

export class UserRegistrationInvitationTokenService {
  static generate(): GeneratedInvitationToken {
    const token = this.generateTokenValue(30);
    const tokenHash = this.hash(token);

    return { token, tokenHash };
  }

  static hash(token: string): string {
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

  static buildInvitationUrl(token: string): string {
    const template =
      process.env.USER_REGISTRATION_INVITATION_URL_TEMPLATE ||
      process.env.USER_REGISTRATION_INVITATION_URL ||
      DEFAULT_INVITATION_URL_TEMPLATE;

    if (template.includes('{{token}}')) {
      return template.replace('{{token}}', token);
    }

    const separator = template.includes('?') ? '&' : '?';
    return `${template}${separator}token=${token}`;
  }

  private static generateTokenValue(length: number): string {
    let token = '';

    while (token.length < length) {
      token += randomBytes(24).toString('base64url');
    }

    return token.slice(0, length);
  }
}
