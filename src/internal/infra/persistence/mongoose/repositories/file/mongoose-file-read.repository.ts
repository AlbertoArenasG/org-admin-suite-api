import { Injectable } from '@nestjs/common';

import { IFileReadRepository } from '@domain/ports/repositories';
import { File } from '@domain/entities';
import { MongooseFileBaseRepository } from './mongoose-file-base.repository';

@Injectable()
export class MongooseFileReadRepositoryImpl
  extends MongooseFileBaseRepository
  implements IFileReadRepository
{
  async findById(fileId: string): Promise<{ data: File | null }> {
    const document = await this.fileModel.findOne({ file_id: fileId }).exec();

    return {
      data: document ? this.toDomain(document) : null,
    };
  }

  async findManyByIds(fileIds: string[]): Promise<{ data: File[] }> {
    if (!fileIds || fileIds.length === 0) {
      return { data: [] };
    }

    const documents = await this.fileModel
      .find({ file_id: { $in: fileIds } })
      .exec();

    const data = documents
      .map((document) => this.toDomain(document))
      .filter((file): file is File => file !== null);

    return { data };
  }
}
