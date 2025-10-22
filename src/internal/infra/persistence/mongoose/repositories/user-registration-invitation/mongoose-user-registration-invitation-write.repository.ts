import { Injectable } from '@nestjs/common';

import {
  CreateUserRegistrationInvitationRecord,
  IUserRegistrationInvitationWriteRepository,
  UserRegistrationInvitationDecision,
  UserRegistrationInvitationRecord,
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

    await entity.save();

    return {
      data: this.toDomain(entity),
    };
  }

  async markAsConsumed(
    invitationId: string,
    consumedAt: Date,
  ): Promise<{ data: UserRegistrationInvitationRecord | null }> {
    const updated = await this.invitationModel.findOneAndUpdate(
      { invitation_id: invitationId },
      {
        consumed_at: consumedAt,
        status: UserRegistrationInvitationStatus.CONSUMED,
      },
      { new: true },
    );

    return {
      data: this.toDomain(updated),
    };
  }

  async updateStatus(
    invitationId: string,
    status: UserRegistrationInvitationStatus,
    options: {
      respondedAt?: Date;
      decision?: UserRegistrationInvitationDecision | null;
    } = {},
  ): Promise<{ data: UserRegistrationInvitationRecord | null }> {
    const updatePayload: Record<string, any> = {
      status,
    };

    if (options.respondedAt !== undefined) {
      updatePayload.responded_at = options.respondedAt;
    }

    if (options.decision !== undefined) {
      updatePayload.response_decision = options.decision;
    }

    const updated = await this.invitationModel.findOneAndUpdate(
      { invitation_id: invitationId },
      updatePayload,
      { new: true },
    );

    return {
      data: this.toDomain(updated),
    };
  }
}
