import { SystemRole } from '@domain/entities';

export interface AuthTokenPayloadDto {
  sub: string;
  systemRole: SystemRole;
  roleId: string | null;
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
    typeof candidate.systemRole === 'string' &&
    (typeof candidate.roleId === 'string' || candidate.roleId === null)
  );
}
