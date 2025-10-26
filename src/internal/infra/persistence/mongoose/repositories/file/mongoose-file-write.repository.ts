import { Injectable } from '@nestjs/common';

import { File } from '@domain/entities';
import { IFileWriteRepository } from '@domain/ports/repositories';
import { MongooseFileBaseRepository } from './mongoose-file-base.repository';

@Injectable()
export class MongooseFileWriteRepositoryImpl
  extends MongooseFileBaseRepository
  implements IFileWriteRepository
{
  async create(file: File): Promise<{ data: File | null }> {
    const data = this.toMongoose(file);
    const document = new this.fileModel(data);
    await document.save();

    return {
      data: this.toDomain(document),
    };
  }
}
