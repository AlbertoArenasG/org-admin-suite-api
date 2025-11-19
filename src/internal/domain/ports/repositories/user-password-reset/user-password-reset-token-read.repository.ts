import { UserPasswordResetTokenRecord } from './user-password-reset-token.types';

export interface IUserPasswordResetTokenReadRepository {
  findByTokenHash(
    tokenHash: string,
  ): Promise<{ data: UserPasswordResetTokenRecord | null }>;
}

export const IUserPasswordResetTokenReadRepositoryToken = Symbol(
  'IUserPasswordResetTokenReadRepository',
);
