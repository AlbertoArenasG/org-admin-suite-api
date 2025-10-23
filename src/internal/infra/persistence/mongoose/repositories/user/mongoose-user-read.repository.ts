import { Injectable } from '@nestjs/common';

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
    const { page, perPage, includeMasterUsers, sortBy, sortDirection } = params;
    const skip = (page - 1) * perPage;
    const roleFilter = includeMasterUsers
      ? {}
      : {
          role: {
            $nin: [UserRole.MASTER_ADMIN, UserRole.MASTER_STAFF],
          },
        };
    const filter = {
      status: { $ne: UserStatus.DELETED },
      ...roleFilter,
    };
    const primaryField = sortBy === 'name' ? 'name' : 'lastname';
    const secondaryField = sortBy === 'name' ? 'lastname' : 'name';
    const direction = sortDirection === 'desc' ? -1 : 1;
    const sortCriteria: Record<string, 1 | -1> = {
      [primaryField]: direction,
      [secondaryField]: direction,
    };

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
}
