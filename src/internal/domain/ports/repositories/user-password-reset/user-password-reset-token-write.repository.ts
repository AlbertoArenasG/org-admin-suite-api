import {
  CreateUserPasswordResetTokenRecord,
  UserPasswordResetTokenRecord,
} from './user-password-reset-token.types';

export interface IUserPasswordResetTokenWriteRepository {
  create(
    record: CreateUserPasswordResetTokenRecord,
  ): Promise<{ data: UserPasswordResetTokenRecord | null }>;

  markAsConsumed(
    passwordResetTokenId: string,
    consumedAt: Date,
  ): Promise<{ data: UserPasswordResetTokenRecord | null }>;

  invalidateAllForUser(userId: string): Promise<void>;
}

export const IUserPasswordResetTokenWriteRepositoryToken = Symbol(
  'IUserPasswordResetTokenWriteRepository',
);
