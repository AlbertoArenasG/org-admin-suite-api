import { SetMetadata } from '@nestjs/common';

export const SCOPE_METADATA_KEY = 'auth_scopes';

export type ScopeType = 'MASTER';

export const Scopes = (...scopes: ScopeType[]) =>
  SetMetadata(SCOPE_METADATA_KEY, scopes);

export const MASTER_SCOPE: ScopeType = 'MASTER';
