import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { SystemRole } from '@domain/entities';
import { User, UserStatus } from '@domain/entities/user.entity';
import {
  FindUsersParams,
  FindUsersResult,
  IUserReadRepository,
} from '@src/internal/domain/ports/repositories';
import { MongooseUserBaseRepository } from './mongoose-user-base.repository';
import {
  CustomerDocument,
  UserCustomerRelationshipDocument,
  UserDocument,
} from '@infra/persistence/mongoose/schemas';
import { MongooseTransactionContext } from '@infra/persistence/mongoose/transactions';

@Injectable()
export class MongooseUserReadRepositoryImpl
  extends MongooseUserBaseRepository
  implements IUserReadRepository
{
  constructor(
    @InjectModel(UserDocument.name) userModel: Model<UserDocument>,
    transactionContext: MongooseTransactionContext,
    @InjectModel(CustomerDocument.name)
    private readonly customerModel: Model<CustomerDocument>,
    @InjectModel(UserCustomerRelationshipDocument.name)
    private readonly relationshipModel: Model<UserCustomerRelationshipDocument>,
  ) {
    super(userModel, transactionContext);
  }

  async findByEmail(email: string): Promise<{ data: User | null }> {
    const document = await this.userModel
      .findOne({ email })
      .session(this.transactionContext.getSession() ?? null)
      .exec();

    return {
      data: document ? this.toDomain(document) : null,
    };
  }

  async findById(userId: string): Promise<{ data: User | null }> {
    const document = await this.userModel
      .findOne({ user_id: userId })
      .session(this.transactionContext.getSession() ?? null)
      .exec();

    return {
      data: document ? this.toDomain(document) : null,
    };
  }

  async findAll(params: FindUsersParams): Promise<FindUsersResult> {
    const {
      page,
      perPage,
      actorSystemRole,
      sorts,
      search,
      customerId,
      hasCustomerRelationship,
    } = params;
    const skip = (page - 1) * perPage;
    const roleFilter =
      actorSystemRole === SystemRole.MASTER_ADMIN
        ? {}
        : { system_role: { $ne: SystemRole.MASTER_ADMIN } };
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

    if (customerId !== null && hasCustomerRelationship !== null) {
      return this.findAllByCustomerRelationship({
        filter,
        sortCriteria,
        skip,
        perPage,
        customerId,
        hasCustomerRelationship,
      });
    }

    const [documents, total] = await Promise.all([
      this.userModel
        .find(filter)
        .sort(sortCriteria)
        .skip(skip)
        .limit(perPage)
        .session(this.transactionContext.getSession() ?? null)
        .exec(),
      this.userModel
        .countDocuments(filter)
        .session(this.transactionContext.getSession() ?? null)
        .exec(),
    ]);

    return {
      data: documents.map((document) => this.toDomain(document)),
      total,
    };
  }

  private async findAllByCustomerRelationship({
    filter,
    sortCriteria,
    skip,
    perPage,
    customerId,
    hasCustomerRelationship,
  }: {
    filter: Record<string, unknown>;
    sortCriteria: Record<string, 1 | -1>;
    skip: number;
    perPage: number;
    customerId: string;
    hasCustomerRelationship: boolean;
  }): Promise<FindUsersResult> {
    const relationshipMatch = hasCustomerRelationship
      ? { 'matching_relationships.0': { $exists: true } }
      : { 'matching_relationships.0': { $exists: false } };
    const matchStages = [
      { $match: { ...filter, system_role: SystemRole.USER } },
      {
        $lookup: {
          from: this.customerModel.collection.name,
          pipeline: [{ $match: { customer_id: customerId } }],
          as: 'target_customer',
        },
      },
      { $match: { 'target_customer.0': { $exists: true } } },
      {
        $lookup: {
          from: this.relationshipModel.collection.name,
          let: { userId: '$user_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$user_id', '$$userId'] },
                    { $eq: ['$customer_id', customerId] },
                  ],
                },
              },
            },
          ],
          as: 'matching_relationships',
        },
      },
      { $match: relationshipMatch },
    ];
    const session = this.transactionContext.getSession() ?? null;
    const [documents, totalResult] = await Promise.all([
      this.userModel
        .aggregate<UserDocument>([
          ...matchStages,
          { $sort: sortCriteria },
          { $skip: skip },
          { $limit: perPage },
          { $project: { target_customer: 0, matching_relationships: 0 } },
        ])
        .session(session)
        .exec(),
      this.userModel
        .aggregate<{ total: number }>([...matchStages, { $count: 'total' }])
        .session(session)
        .exec(),
    ]);

    return {
      data: documents.map((document) => this.toDomain(document)),
      total: totalResult[0]?.total ?? 0,
    };
  }

  async countByRoleId(roleId: string): Promise<number> {
    return this.userModel
      .countDocuments({
        role_id: roleId,
        status: { $ne: UserStatus.DELETED },
      })
      .exec();
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
      system_role: 'system_role',
      created_at: 'createdAt',
    };

    return mapping[field] ?? 'lastname';
  }
}

function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
