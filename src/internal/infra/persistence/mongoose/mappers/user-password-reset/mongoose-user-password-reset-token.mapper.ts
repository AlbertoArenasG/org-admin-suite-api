import {
  CreateUserPasswordResetTokenRecord,
  UserPasswordResetTokenRecord,
} from '@domain/ports/repositories';
import { UserPasswordResetTokenDocument } from '@infra/persistence/mongoose/schemas';

export class MongooseUserPasswordResetTokenMapper {
  static toDomain(
    document: UserPasswordResetTokenDocument | null,
  ): UserPasswordResetTokenRecord | null {
    if (!document) return null;

    return {
      id: document._id?.toString(),
      passwordResetTokenId: document.password_reset_token_id,
      userId: document.user_id,
      email: document.email,
      tokenHash: document.token_hash,
      requestedAt: document.requested_at,
      expiresAt: document.expires_at,
      consumedAt: document.consumed_at ?? null,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }

  static toMongoose(record: CreateUserPasswordResetTokenRecord) {
    return {
      user_id: record.userId,
      email: record.email,
      token_hash: record.tokenHash,
      requested_at: record.requestedAt,
      expires_at: record.expiresAt,
    };
  }
}
