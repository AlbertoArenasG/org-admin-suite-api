import { Injectable } from '@nestjs/common';

import {
  FindRolesParams,
  FindRolesResult,
  IRoleReadRepository,
} from '@domain/ports/repositories';
import { Role, RoleScope, RoleStatus, SystemRole } from '@domain/entities';
import { MongooseRoleBaseRepository } from './mongoose-role-base.repository';

@Injectable()
export class MongooseRoleReadRepositoryImpl
  extends MongooseRoleBaseRepository
  implements IRoleReadRepository
{
  async findById(id: string): Promise<{ data: Role | null }> {
    const document = await this.roleModel
      .findOne({
        $or: [{ role_id: id }, { code: id }],
      })
      .exec();

    return { data: this.toDomain(document) };
  }

  async findByCode(code: string): Promise<{ data: Role | null }> {
    const document = await this.roleModel.findOne({ code }).exec();

    return { data: this.toDomain(document) };
  }

  async findByName(name: string): Promise<{ data: Role | null }> {
    const document = await this.roleModel.findOne({ name }).exec();

    return { data: this.toDomain(document) };
  }

  async findDefaultByScope(
    scope: Role['scope'],
  ): Promise<{ data: Role | null }> {
    const document = await this.roleModel
      .findOne({
        scope,
        is_default: true,
        status: { $ne: RoleStatus.DELETED },
      })
      .exec();

    return { data: this.toDomain(document) };
  }

  async findAll(params: FindRolesParams): Promise<FindRolesResult> {
    const {
      page,
      perPage,
      actorSystemRole,
      search,
      scope,
      status,
      isSystem,
      sorts,
    } = params;
    const skip = (page - 1) * perPage;

    const filter: Record<string, unknown> = {};

    if (search && search.trim().length > 0) {
      filter.$or = [
        { name: { $regex: escapeRegex(search), $options: 'i' } },
        { code: { $regex: escapeRegex(search), $options: 'i' } },
      ];
    }

    if (scope) {
      filter.scope = scope;
    }

    if (status) {
      filter.status = status;
    } else {
      filter.status = { $ne: RoleStatus.DELETED };
    }

    if (isSystem !== null && isSystem !== undefined) {
      filter.is_system = isSystem;
    }

    if (actorSystemRole !== SystemRole.MASTER_ADMIN) {
      filter.scope = scope ?? { $ne: RoleScope.MASTER_ADMIN };
    }

    const sortCriteria = this.buildSortCriteria(sorts);

    const [documents, total] = await Promise.all([
      this.roleModel
        .find(filter)
        .sort(sortCriteria)
        .skip(skip)
        .limit(perPage)
        .exec(),
      this.roleModel.countDocuments(filter).exec(),
    ]);

    return {
      data: documents
        .map((document) => this.toDomain(document))
        .filter((role): role is Role => role !== null),
      total,
    };
  }

  private buildSortCriteria(
    sorts: FindRolesParams['sorts'],
  ): Record<string, 1 | -1> {
    if (!sorts || sorts.length === 0) {
      return { createdAt: -1 };
    }

    const mapping: Record<string, string> = {
      name: 'name',
      code: 'code',
      status: 'status',
      created_at: 'createdAt',
    };

    const criteria: Record<string, 1 | -1> = {};

    for (const sort of sorts) {
      const field = mapping[sort.field] ?? 'createdAt';
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
