import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ServiceEntry } from '@domain/entities';
import { IServiceEntryRepository } from '@domain/ports/repositories';
import { ServiceEntryDocument } from '@infra/persistence/mongoose/schemas';
import { MongooseServiceEntryMapper } from '@infra/persistence/mongoose/mappers';

@Injectable()
export class MongooseServiceEntryRepositoryImpl
  implements IServiceEntryRepository
{
  constructor(
    @InjectModel(ServiceEntryDocument.name)
    private readonly model: Model<ServiceEntryDocument>,
  ) {}

  async create(entry: ServiceEntry): Promise<{ data: ServiceEntry | null }> {
    const data = MongooseServiceEntryMapper.toMongoose(entry);
    const document = new this.model(data);
    await document.save();

    return {
      data: MongooseServiceEntryMapper.toDomain(document),
    };
  }

  async findByServiceOrderIdentifier(
    serviceOrderIdentifier: string,
  ): Promise<{ data: ServiceEntry | null }> {
    const document = await this.model
      .findOne({ service_order_identifier: serviceOrderIdentifier })
      .exec();

    return {
      data: document ? MongooseServiceEntryMapper.toDomain(document) : null,
    };
  }
}
