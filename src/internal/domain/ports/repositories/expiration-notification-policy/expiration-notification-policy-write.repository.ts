import { ExpirationNotificationPolicy } from '@domain/entities';

export interface IExpirationNotificationPolicyWriteRepository {
  create(
    expirationNotificationPolicy: ExpirationNotificationPolicy,
  ): Promise<{ data: ExpirationNotificationPolicy | null }>;
  update(
    expirationNotificationPolicy: ExpirationNotificationPolicy,
  ): Promise<{ data: ExpirationNotificationPolicy | null }>;
}

export const IExpirationNotificationPolicyWriteRepositoryToken = Symbol(
  'IExpirationNotificationPolicyWriteRepository',
);
