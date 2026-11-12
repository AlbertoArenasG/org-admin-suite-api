import { Injectable } from '@nestjs/common';

import { File } from '@domain/entities';
import { IFileWriteRepository } from '@domain/ports/repositories';
import { MongooseFileBaseRepository } from './mongoose-file-base.repository';
import { MongooseTransactionContext } from '@infra/persistence/mongoose/transactions';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FileDocument } from '@infra/persistence/mongoose/schemas';

@Injectable()
export class MongooseFileWriteRepositoryImpl
  extends MongooseFileBaseRepository
  implements IFileWriteRepository
{
  constructor(
    @InjectModel(FileDocument.name) fileModel: Model<FileDocument>,
    private readonly transactionContext: MongooseTransactionContext,
  ) {
    super(fileModel);
  }

  async create(file: File): Promise<{ data: File | null }> {
    const data = this.toMongoose(file);
    const document = new this.fileModel(data);
    await document.save({ session: this.transactionContext.getSession() });

    return {
      data: this.toDomain(document),
    };
  }
}
