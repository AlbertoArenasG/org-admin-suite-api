import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { File } from '@domain/entities';
import {
  FileCreateResult,
  FileFindResult,
  IFileRepository,
} from '@domain/ports/repositories';
import { FileDocument } from '@infra/persistence/mongoose/schemas';
import { MongooseFileMapper } from '@infra/persistence/mongoose/mappers';

@Injectable()
export class MongooseFileRepositoryImpl implements IFileRepository {
  constructor(
    @InjectModel(FileDocument.name)
    private readonly fileModel: Model<FileDocument>,
  ) {}

  async create(file: File): Promise<FileCreateResult> {
    const data = MongooseFileMapper.toMongoose(file);
    const document = new this.fileModel(data);
    await document.save();

    return {
      data: MongooseFileMapper.toDomain(document),
    };
  }

  async findById(fileId: string): Promise<FileFindResult> {
    const document = await this.fileModel.findOne({ file_id: fileId }).exec();

    return {
      data: document ? MongooseFileMapper.toDomain(document) : null,
    };
  }
}
