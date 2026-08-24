import { Injectable } from '@nestjs/common';
import { FilterQuery } from 'mongoose';

import {
  FindApplicationUserRegistrationInvitationsParams,
  FindApplicationUserRegistrationInvitationsResult,
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
  ): Promise<{ data: UserRegistrationInvitationRecord | null }> {
    const query: FilterQuery<UserRegistrationInvitationDocument> = {
      email,
      scope,
      consumed_at: null,
      status: UserRegistrationInvitationStatus.PENDING,
    };

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

  async findAllApplicationInvitations(
    params: FindApplicationUserRegistrationInvitationsParams,
  ): Promise<FindApplicationUserRegistrationInvitationsResult> {
    const { page, perPage, search, status, sorts } = params;
    const skip = (page - 1) * perPage;
    const filter: FilterQuery<UserRegistrationInvitationDocument> = {
      scope: UserRegistrationInvitationScope.APPLICATION,
    };

    if (search?.trim()) {
      filter.email = { $regex: escapeRegex(search), $options: 'i' };
    }

    if (status) {
      filter.status = status;
    }

    const [documents, total] = await Promise.all([
      this.invitationModel
        .find(filter)
        .sort(this.buildSortCriteria(sorts))
        .skip(skip)
        .limit(perPage)
        .exec(),
      this.invitationModel.countDocuments(filter).exec(),
    ]);

    return {
      data: documents
        .map((document) => this.toDomain(document))
        .filter(
          (invitation): invitation is UserRegistrationInvitationRecord =>
            invitation !== null,
        ),
      total,
    };
  }

  async findApplicationInvitationById(
    invitationId: string,
  ): Promise<{ data: UserRegistrationInvitationRecord | null }> {
    const document = await this.invitationModel.findOne({
      invitation_id: invitationId,
      scope: UserRegistrationInvitationScope.APPLICATION,
    });

    return {
      data: this.toDomain(document),
    };
  }

  private buildSortCriteria(
    sorts: FindApplicationUserRegistrationInvitationsParams['sorts'],
  ): Record<string, 1 | -1> {
    if (!sorts || sorts.length === 0) {
      return { createdAt: -1 };
    }

    const fieldMapping: Record<string, string> = {
      status: 'status',
      created_at: 'createdAt',
    };
    const criteria: Record<string, 1 | -1> = {};

    for (const sort of sorts) {
      const field = fieldMapping[sort.field] ?? 'createdAt';
      criteria[field] = sort.direction === 'desc' ? -1 : 1;
    }

    if (!criteria.createdAt) {
      criteria.createdAt = -1;
    }

    return criteria;
  }
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
