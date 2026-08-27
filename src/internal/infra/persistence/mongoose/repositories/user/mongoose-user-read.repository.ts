import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { SystemRole } from '@domain/entities';
import { User, UserStatus } from '@domain/entities/user.entity';
import {
  FindUnassignedUsersParams,
  FindUsersRelatedToCustomerParams,
  FindUsersParams,
  FindUsersResult,
  IUserReadRepository,
} from '@src/internal/domain/ports/repositories';
import { MongooseUserBaseRepository } from './mongoose-user-base.repository';
import {
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
    const { page, perPage, actorSystemRole, sorts, search, isInternalStaff } =
      params;
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
      ...(isInternalStaff === null
        ? {}
        : { is_internal_staff: isInternalStaff }),
    };
    const sortCriteria = this.buildSortCriteria(sorts);

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

  async findRelatedToCustomer(
    params: FindUsersRelatedToCustomerParams,
  ): Promise<FindUsersResult> {
    return this.findUsersByRelationship({
      filter: {
        status: { $ne: UserStatus.DELETED },
        system_role: SystemRole.USER,
        ...(params.isInternalStaff === null
          ? {}
          : { is_internal_staff: params.isInternalStaff }),
        ...this.buildSearchFilter(params.search),
      },
      customerId: params.customerId,
      relationshipExists: true,
      sortCriteria: this.buildSortCriteria(params.sorts),
      skip: (params.page - 1) * params.perPage,
      perPage: params.perPage,
    });
  }

  async findUnassigned(
    params: FindUnassignedUsersParams,
  ): Promise<FindUsersResult> {
    return this.findUsersByRelationship({
      filter: {
        status: { $ne: UserStatus.DELETED },
        system_role: { $ne: SystemRole.MASTER_ADMIN },
        ...(params.isInternalStaff === null
          ? {}
          : { is_internal_staff: params.isInternalStaff }),
        ...this.buildSearchFilter(params.search),
      },
      relationshipExists: false,
      sortCriteria: this.buildSortCriteria(params.sorts),
      skip: (params.page - 1) * params.perPage,
      perPage: params.perPage,
    });
  }

  async findUnassignedActiveUsers(): Promise<{ data: User[] }> {
    const session = this.transactionContext.getSession() ?? null;
    const documents = await this.userModel
      .aggregate<UserDocument>([
        {
          $match: {
            status: UserStatus.ACTIVE,
            system_role: SystemRole.USER,
          },
        },
        {
          $lookup: {
            from: this.relationshipModel.collection.name,
            let: { userId: '$user_id' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$user_id', '$$userId'] },
                },
              },
            ],
            as: 'relationships',
          },
        },
        { $match: { 'relationships.0': { $exists: false } } },
        { $sort: { lastname: 1, name: 1, createdAt: 1 } },
        { $project: { relationships: 0 } },
      ])
      .session(session)
      .exec();

    return {
      data: documents.map((document) => this.toDomain(document)),
    };
  }

  private async findUsersByRelationship({
    filter,
    customerId,
    relationshipExists,
    sortCriteria,
    skip,
    perPage,
  }: {
    filter: Record<string, unknown>;
    customerId?: string;
    relationshipExists: boolean;
    sortCriteria: Record<string, 1 | -1>;
    skip: number;
    perPage: number;
  }): Promise<FindUsersResult> {
    const relationshipMatch = customerId
      ? {
          $expr: {
            $and: [
              { $eq: ['$user_id', '$$userId'] },
              { $eq: ['$customer_id', customerId] },
            ],
          },
        }
      : {
          $expr: { $eq: ['$user_id', '$$userId'] },
        };
    const relationshipPresence = relationshipExists
      ? { 'matching_relationships.0': { $exists: true } }
      : { 'matching_relationships.0': { $exists: false } };
    const matchStages = [
      { $match: filter },
      {
        $lookup: {
          from: this.relationshipModel.collection.name,
          let: { userId: '$user_id' },
          pipeline: [{ $match: relationshipMatch }],
          as: 'matching_relationships',
        },
      },
      { $match: relationshipPresence },
    ];
    const session = this.transactionContext.getSession() ?? null;
    const [documents, totalResult] = await Promise.all([
      this.userModel
        .aggregate<UserDocument>([
          ...matchStages,
          { $sort: sortCriteria },
          { $skip: skip },
          { $limit: perPage },
          { $project: { matching_relationships: 0 } },
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

  private buildSearchFilter(search: string | null): Record<string, unknown> {
    if (!search || search.trim().length === 0) {
      return {};
    }

    return {
      $or: [
        { full_name: { $regex: escapeRegex(search), $options: 'i' } },
        { email: { $regex: escapeRegex(search), $options: 'i' } },
      ],
    };
  }
}

function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
