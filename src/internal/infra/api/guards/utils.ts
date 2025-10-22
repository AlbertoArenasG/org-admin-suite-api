import { Request } from 'express';

import { AuthenticationException } from '@domain/exceptions';

export function extractBearerToken(request: Request): string {
  const authHeader = request.headers['authorization'];

  if (!authHeader) {
    throw AuthenticationException.tokenMissing();
  }

  if (Array.isArray(authHeader)) {
    throw AuthenticationException.authorizationHeaderInvalid({
      reason: 'multiple_values',
    });
  }

  const parts = authHeader.trim().split(/\s+/);

  if (parts.length !== 2) {
    throw AuthenticationException.authorizationHeaderInvalid({
      reason: 'unexpected_format',
    });
  }

  const [scheme, token] = parts;

  if (!scheme || scheme.toLowerCase() !== 'bearer') {
    throw AuthenticationException.authorizationHeaderInvalid({
      expectedScheme: 'Bearer',
      actualScheme: scheme,
    });
  }

  if (!token) {
    throw AuthenticationException.tokenMissing();
  }

  return token;
}

export function isTokenExpiredError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    (error as { name: string }).name === 'TokenExpiredError'
  );
}

export function getJwtErrorName(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'name' in error) {
    return String((error as { name?: string }).name);
  }

  return 'Unknown';
}
