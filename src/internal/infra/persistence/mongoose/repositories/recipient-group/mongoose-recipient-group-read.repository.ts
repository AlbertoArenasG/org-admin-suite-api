import { Injectable } from '@nestjs/common';

import { RecipientGroup, RecipientGroupStatus } from '@domain/entities';
import {
  FindRecipientGroupsParams,
  FindRecipientGroupsResult,
  IRecipientGroupReadRepository,
} from '@domain/ports/repositories';
import { MongooseRecipientGroupBaseRepository } from './mongoose-recipient-group-base.repository';

@Injectable()
export class MongooseRecipientGroupReadRepositoryImpl
  extends MongooseRecipientGroupBaseRepository
  implements IRecipientGroupReadRepository
{
  async findById(
    recipientGroupId: string,
  ): Promise<{ data: RecipientGroup | null }> {
    const document = await this.recipientGroupModel
      .findOne({ recipient_group_id: recipientGroupId })
      .exec();

    return { data: this.toDomain(document) };
  }

  async findByIds(
    recipientGroupIds: string[],
  ): Promise<{ data: RecipientGroup[] }> {
    if (recipientGroupIds.length === 0) {
      return { data: [] };
    }

    const documents = await this.recipientGroupModel
      .find({ recipient_group_id: { $in: recipientGroupIds } })
      .exec();

    return {
      data: documents
        .map((document) => this.toDomain(document))
        .filter(
          (recipientGroup): recipientGroup is RecipientGroup =>
            recipientGroup !== null,
        ),
    };
  }

  async findByName(name: string): Promise<{ data: RecipientGroup | null }> {
    const document = await this.recipientGroupModel.findOne({ name }).exec();

    return { data: this.toDomain(document) };
  }

  async findByCode(code: string): Promise<{ data: RecipientGroup | null }> {
    const document = await this.recipientGroupModel.findOne({ code }).exec();

    return { data: this.toDomain(document) };
  }

  async findAll(
    params: FindRecipientGroupsParams,
  ): Promise<FindRecipientGroupsResult> {
    const { page, perPage, search, status, sorts } = params;
    const skip = (page - 1) * perPage;
    const filter: Record<string, unknown> = {};

    if (search && search.trim().length > 0) {
      filter.$or = [
        { name: { $regex: escapeRegex(search), $options: 'i' } },
        { code: { $regex: escapeRegex(search), $options: 'i' } },
        { description: { $regex: escapeRegex(search), $options: 'i' } },
      ];
    }

    if (status) {
      filter.status = status;
    } else {
      filter.status = { $ne: RecipientGroupStatus.DELETED };
    }

    const sortCriteria = this.buildSortCriteria(sorts);

    const [documents, total] = await Promise.all([
      this.recipientGroupModel
        .find(filter)
        .sort(sortCriteria)
        .skip(skip)
        .limit(perPage)
        .exec(),
      this.recipientGroupModel.countDocuments(filter).exec(),
    ]);

    return {
      data: documents
        .map((document) => this.toDomain(document))
        .filter(
          (recipientGroup): recipientGroup is RecipientGroup =>
            recipientGroup !== null,
        ),
      total,
    };
  }

  private buildSortCriteria(
    sorts: FindRecipientGroupsParams['sorts'],
  ): Record<string, 1 | -1> {
    if (!sorts || sorts.length === 0) {
      return { createdAt: -1 };
    }

    const mapping: Record<string, string> = {
      name: 'name',
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
