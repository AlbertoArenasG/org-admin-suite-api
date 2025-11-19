export interface CreateUserPasswordResetTokenRecord {
  userId: string;
  email: string;
  tokenHash: string;
  requestedAt: Date;
  expiresAt: Date;
}

export interface UserPasswordResetTokenRecord
  extends CreateUserPasswordResetTokenRecord {
  id: string;
  passwordResetTokenId: string;
  consumedAt?: Date | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}
