import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ServiceEntryAccess } from '@domain/entities';
import { IServiceEntryAccessRepository } from '@domain/ports/repositories';
import { ServiceEntryAccessDocument } from '@infra/persistence/mongoose/schemas';
import { MongooseServiceEntryAccessMapper } from '@infra/persistence/mongoose/mappers';

@Injectable()
export class MongooseServiceEntryAccessRepositoryImpl
  implements IServiceEntryAccessRepository
{
  constructor(
    @InjectModel(ServiceEntryAccessDocument.name)
    private readonly model: Model<ServiceEntryAccessDocument>,
  ) {}

  async create(
    access: ServiceEntryAccess,
  ): Promise<{ data: ServiceEntryAccess | null }> {
    const data = MongooseServiceEntryAccessMapper.toMongoose(access);
    const document = new this.model(data);
    await document.save();

    return {
      data: MongooseServiceEntryAccessMapper.toDomain(document),
    };
  }

  async update(
    access: ServiceEntryAccess,
  ): Promise<{ data: ServiceEntryAccess | null }> {
    const data = MongooseServiceEntryAccessMapper.toMongoose(access);

    const document = await this.model
      .findOneAndUpdate({ service_entry_access_id: access.id }, data, {
        new: true,
      })
      .exec();

    return {
      data: document
        ? MongooseServiceEntryAccessMapper.toDomain(document)
        : null,
    };
  }

  async findByTokenHash(
    tokenHash: string,
  ): Promise<{ data: ServiceEntryAccess | null }> {
    const document = await this.model.findOne({ token_hash: tokenHash }).exec();

    return {
      data: document
        ? MongooseServiceEntryAccessMapper.toDomain(document)
        : null,
    };
  }
}
