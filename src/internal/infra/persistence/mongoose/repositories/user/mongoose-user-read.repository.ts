import { Injectable } from '@nestjs/common';

import { SystemRole } from '@domain/entities';
import { User, UserRole, UserStatus } from '@domain/entities/user.entity';
import {
  FindUsersParams,
  FindUsersResult,
  IUserReadRepository,
} from '@src/internal/domain/ports/repositories';
import { MongooseUserBaseRepository } from './mongoose-user-base.repository';

@Injectable()
export class MongooseUserReadRepositoryImpl
  extends MongooseUserBaseRepository
  implements IUserReadRepository
{
  async findByEmail(email: string): Promise<{ data: User | null }> {
    const document = await this.userModel.findOne({ email });

    return {
      data: document ? this.toDomain(document) : null,
    };
  }

  async findById(userId: string): Promise<{ data: User | null }> {
    const document = await this.userModel.findOne({ user_id: userId });

    return {
      data: document ? this.toDomain(document) : null,
    };
  }

  async findAll(params: FindUsersParams): Promise<FindUsersResult> {
    const { page, perPage, actorSystemRole, sorts, search } = params;
    const skip = (page - 1) * perPage;
    const roleFilter =
      actorSystemRole === SystemRole.MASTER_ADMIN
        ? {}
        : {
            $and: [
              {
                $or: [
                  { role: { $exists: false } },
                  {
                    role: {
                      $nin: [UserRole.MASTER_ADMIN, UserRole.MASTER_STAFF],
                    },
                  },
                ],
              },
              {
                $or: [
                  { system_role: { $exists: false } },
                  { system_role: { $ne: SystemRole.MASTER_ADMIN } },
                ],
              },
            ],
          };
    const searchFilter =
      search && search.trim().length > 0
        ? {
            $or: [
              { full_name: { $regex: escapeRegex(search), $options: 'i' } },
              { email: { $regex: escapeRegex(search), $options: 'i' } },
            ],
          }
        : {};

    const filter = {
      status: { $ne: UserStatus.DELETED },
      ...roleFilter,
      ...searchFilter,
    };
    const sortCriteria = this.buildSortCriteria(sorts);

    const [documents, total] = await Promise.all([
      this.userModel
        .find(filter)
        .sort(sortCriteria)
        .skip(skip)
        .limit(perPage)
        .exec(),
      this.userModel.countDocuments(filter).exec(),
    ]);

    return {
      data: documents.map((document) => this.toDomain(document)),
      total,
    };
  }

  private buildSortCriteria(
    sorts: Array<{
      field: FindUsersParams['sorts'][number]['field'];
      direction: FindUsersParams['sorts'][number]['direction'];
    }>,
  ): Record<string, 1 | -1> {
    if (!sorts || sorts.length === 0) {
      return { lastname: 1, name: 1, createdAt: 1 };
    }

    const criteria: Record<string, 1 | -1> = {};

    for (const sort of sorts) {
      const field = this.mapField(sort.field);
      criteria[field] = sort.direction === 'desc' ? -1 : 1;
    }

    if (!criteria.createdAt) {
      criteria.createdAt = 1;
    }

    return criteria;
  }

  private mapField(field: FindUsersParams['sorts'][number]['field']): string {
    const mapping: Record<string, string> = {
      name: 'name',
      lastname: 'lastname',
      email: 'email',
      status: 'status',
      role: 'role',
      created_at: 'createdAt',
    };

    return mapping[field] ?? 'lastname';
  }
}

function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
