import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BillingRecordComment } from '@domain/entities';
import { IBillingRecordCommentRepository } from '@domain/ports/repositories/customer-service-record-billing';
import { BillingRecordCommentDocument } from '@infra/persistence/mongoose/schemas';
import { MongooseTransactionContext } from '@infra/persistence/mongoose/transactions';

@Injectable()
export class MongooseBillingRecordCommentRepositoryImpl
  implements IBillingRecordCommentRepository
{
  constructor(
    @InjectModel(BillingRecordCommentDocument.name)
    private readonly model: Model<BillingRecordCommentDocument>,
    private readonly transactions: MongooseTransactionContext,
  ) {}
  async create(comment: BillingRecordComment): Promise<BillingRecordComment> {
    await new this.model({
      comment_id: comment.id,
      record_id: comment.recordId,
      text: comment.text,
      visibility: comment.visibility,
      created_at: comment.createdAt,
      updated_at: comment.updatedAt,
      created_by: comment.createdBy,
      updated_by: comment.updatedBy,
    }).save({ session: this.transactions.getSession() });
    return comment;
  }
  async findAll(recordId: string, page: number, perPage: number) {
    const filter = { record_id: recordId };
    const [documents, total] = await Promise.all([
      this.model
        .find(filter)
        .sort({ created_at: -1, comment_id: -1 })
        .skip((page - 1) * perPage)
        .limit(perPage)
        .session(this.transactions.getSession() ?? null)
        .lean()
        .exec(),
      this.model
        .countDocuments(filter)
        .session(this.transactions.getSession() ?? null)
        .exec(),
    ]);
    return {
      data: documents.map((document) => ({
        id: document.comment_id,
        recordId: document.record_id,
        text: document.text,
        visibility: document.visibility,
        createdAt: document.created_at,
        updatedAt: document.updated_at,
        createdBy: document.created_by,
        updatedBy: document.updated_by,
      })),
      total,
    };
  }
}
