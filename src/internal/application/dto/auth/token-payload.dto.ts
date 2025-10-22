import { UserRole } from '@domain/entities';

export interface AuthTokenPayloadDto {
  sub: string;
  role: UserRole;
  isMaster: boolean;
  iat?: number;
  exp?: number;
}

export function isAuthTokenPayloadDto(
  payload: unknown,
): payload is AuthTokenPayloadDto {
  if (!payload || typeof payload !== 'object' || payload === null) return false;

  const candidate = payload as Record<string, unknown>;

  return (
    typeof candidate.sub === 'string' &&
    typeof candidate.role === 'string' &&
    typeof candidate.isMaster === 'boolean'
  );
}
