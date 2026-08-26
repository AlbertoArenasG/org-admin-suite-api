import { Injectable } from '@nestjs/common';

import {
  CreateUserRegistrationInvitationRecord,
  IUserRegistrationInvitationWriteRepository,
  MarkUserRegistrationInvitationEmailAcceptedInput,
  RevokePendingApplicationUserRegistrationInvitationInput,
  RotatePendingUserRegistrationInvitationTokenInput,
  UserRegistrationInvitationRecord,
  UserRegistrationInvitationEmailDeliveryStatus,
  UserRegistrationInvitationScope,
  UserRegistrationInvitationStatus,
} from '@domain/ports/repositories';
import { MongooseUserRegistrationInvitationBaseRepository } from './mongoose-user-registration-invitation-base.repository';

@Injectable()
export class MongooseUserRegistrationInvitationWriteRepositoryImpl
  extends MongooseUserRegistrationInvitationBaseRepository
  implements IUserRegistrationInvitationWriteRepository
{
  async create(
    record: CreateUserRegistrationInvitationRecord,
  ): Promise<{ data: UserRegistrationInvitationRecord | null }> {
    const entity = new this.invitationModel(this.toMongoose(record));

    await entity.save({ session: this.transactionContext.getSession() });

    return {
      data: this.toDomain(entity),
    };
  }

  async markAsConsumed(
    invitationId: string,
    consumedAt: Date,
  ): Promise<{ data: UserRegistrationInvitationRecord | null }> {
    const updated = await this.invitationModel
      .findOneAndUpdate(
        { invitation_id: invitationId },
        {
          consumed_at: consumedAt,
          status: UserRegistrationInvitationStatus.CONSUMED,
        },
        { new: true },
      )
      .session(this.transactionContext.getSession() ?? null)
      .exec();

    return {
      data: this.toDomain(updated),
    };
  }

  async rotatePendingInvitationToken(
    input: RotatePendingUserRegistrationInvitationTokenInput,
  ): Promise<{ data: UserRegistrationInvitationRecord | null }> {
    const updated = await this.invitationModel.findOneAndUpdate(
      {
        invitation_id: input.invitationId,
        scope: UserRegistrationInvitationScope.APPLICATION,
        status: UserRegistrationInvitationStatus.PENDING,
        consumed_at: null,
        token_hash: input.expectedTokenHash,
      },
      {
        $set: {
          token_hash: input.tokenHash,
          email_delivery: {
            last_attempt_at: input.attemptedAt,
            last_attempt_status:
              UserRegistrationInvitationEmailDeliveryStatus.FAILED,
          },
        },
        $inc: { resend_count: 1 },
      },
      { new: true },
    );

    return { data: this.toDomain(updated) };
  }

  async markInvitationEmailAccepted(
    input: MarkUserRegistrationInvitationEmailAcceptedInput,
  ): Promise<{ data: UserRegistrationInvitationRecord | null }> {
    const updated = await this.invitationModel.findOneAndUpdate(
      {
        invitation_id: input.invitationId,
        status: UserRegistrationInvitationStatus.PENDING,
        consumed_at: null,
        token_hash: input.tokenHash,
      },
      {
        $set: {
          'email_delivery.last_attempt_status':
            UserRegistrationInvitationEmailDeliveryStatus.ACCEPTED,
        },
      },
      { new: true },
    );

    return { data: this.toDomain(updated) };
  }

  async revokePendingApplicationInvitation(
    input: RevokePendingApplicationUserRegistrationInvitationInput,
  ): Promise<{ data: UserRegistrationInvitationRecord | null }> {
    const updated = await this.invitationModel.findOneAndUpdate(
      {
        invitation_id: input.invitationId,
        scope: UserRegistrationInvitationScope.APPLICATION,
        status: UserRegistrationInvitationStatus.PENDING,
        consumed_at: null,
      },
      {
        $set: {
          status: UserRegistrationInvitationStatus.REVOKED,
          revoked_at: input.revokedAt,
          revoked_by_user_id: input.revokedByUserId,
        },
      },
      { new: true },
    );

    return { data: this.toDomain(updated) };
  }
}
