import { ExpirationStatusPolicy } from '@domain/entities';

export interface IExpirationStatusPolicyWriteRepository {
  create(
    expirationStatusPolicy: ExpirationStatusPolicy,
  ): Promise<{ data: ExpirationStatusPolicy | null }>;
  update(
    expirationStatusPolicy: ExpirationStatusPolicy,
  ): Promise<{ data: ExpirationStatusPolicy | null }>;
}

export const IExpirationStatusPolicyWriteRepositoryToken = Symbol(
  'IExpirationStatusPolicyWriteRepository',
);
