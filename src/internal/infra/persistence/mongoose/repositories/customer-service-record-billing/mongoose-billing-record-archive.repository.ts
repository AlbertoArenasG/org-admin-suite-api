import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BillingRecordArchive } from '@domain/entities';
import { IBillingRecordArchiveRepository } from '@domain/ports/repositories/customer-service-record-billing';
import { BillingRecordArchiveDocument } from '@infra/persistence/mongoose/schemas';
import { MongooseTransactionContext } from '@infra/persistence/mongoose/transactions';

@Injectable()
export class MongooseBillingRecordArchiveRepositoryImpl
  implements IBillingRecordArchiveRepository
{
  constructor(
    @InjectModel(BillingRecordArchiveDocument.name)
    private readonly model: Model<BillingRecordArchiveDocument>,
    private readonly transactions: MongooseTransactionContext,
  ) {}

  async create(archive: BillingRecordArchive): Promise<void> {
    await new this.model({
      archive_id: archive.id,
      record_id: archive.recordId,
      invoice_revision: archive.invoiceRevision,
      invoice: archive.invoice,
      billing: archive.billing,
      archived_at: archive.archivedAt,
      archived_by: archive.archivedBy,
    }).save({ session: this.transactions.getSession() });
  }

  async findById(
    recordId: string,
    archiveId: string,
  ): Promise<BillingRecordArchive | null> {
    const document = await this.model
      .findOne({ record_id: recordId, archive_id: archiveId })
      .session(this.transactions.getSession() ?? null)
      .lean()
      .exec();
    return document ? this.toDomain(document) : null;
  }

  async findAll(recordId: string, page: number, perPage: number) {
    const filter = { record_id: recordId };
    const [documents, total] = await Promise.all([
      this.model
        .find(filter)
        .sort({ archived_at: -1, archive_id: -1 })
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
      data: documents.map((document) => this.toDomain(document)),
      total,
    };
  }

  private toDomain(
    document: BillingRecordArchiveDocument | Record<string, any>,
  ): BillingRecordArchive {
    return {
      id: document.archive_id,
      recordId: document.record_id,
      invoiceRevision: document.invoice_revision,
      invoice: document.invoice,
      billing: document.billing,
      archivedAt: document.archived_at,
      archivedBy: document.archived_by,
    };
  }
}
