import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { File } from '@domain/entities';
import { FileDocument } from '@infra/persistence/mongoose/schemas';
import { MongooseFileMapper } from '@infra/persistence/mongoose/mappers';

@Injectable()
export class MongooseFileBaseRepository {
  constructor(
    @InjectModel(FileDocument.name)
    protected readonly fileModel: Model<FileDocument>,
  ) {}

  protected toDomain(document: FileDocument): File | null {
    return MongooseFileMapper.toDomain(document);
  }

  protected toMongoose(file: File) {
    return MongooseFileMapper.toMongoose(file);
  }
}
