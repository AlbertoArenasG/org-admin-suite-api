import { Injectable } from '@nestjs/common';
import { FilterQuery } from 'mongoose';

import {
  IUserRegistrationInvitationReadRepository,
  UserRegistrationInvitationRecord,
  UserRegistrationInvitationScope,
  UserRegistrationInvitationStatus,
} from '@domain/ports/repositories';
import { UserRegistrationInvitationDocument } from '@infra/persistence/mongoose/schemas';
import { MongooseUserRegistrationInvitationBaseRepository } from './mongoose-user-registration-invitation-base.repository';

@Injectable()
export class MongooseUserRegistrationInvitationReadRepositoryImpl
  extends MongooseUserRegistrationInvitationBaseRepository
  implements IUserRegistrationInvitationReadRepository
{
  async findActiveByEmail(
    email: string,
    scope: UserRegistrationInvitationScope,
    tenantId?: string | null,
  ): Promise<{ data: UserRegistrationInvitationRecord | null }> {
    const query: FilterQuery<UserRegistrationInvitationDocument> = {
      email,
      scope,
      consumed_at: null,
      status: UserRegistrationInvitationStatus.PENDING,
    };

    if (scope === UserRegistrationInvitationScope.TENANT) {
      query.tenant_id = tenantId ?? null;
    } else {
      query.tenant_id = null;
    }

    const document = await this.invitationModel.findOne(query);

    return {
      data: this.toDomain(document),
    };
  }

  async findByTokenHash(
    tokenHash: string,
  ): Promise<{ data: UserRegistrationInvitationRecord | null }> {
    const document = await this.invitationModel.findOne({
      token_hash: tokenHash,
    });

    return {
      data: this.toDomain(document),
    };
  }
}
