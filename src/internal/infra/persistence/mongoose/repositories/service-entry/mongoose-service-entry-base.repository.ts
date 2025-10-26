import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ServiceEntry } from '@domain/entities';
import { ServiceEntryDocument } from '@infra/persistence/mongoose/schemas';
import { MongooseServiceEntryMapper } from '@infra/persistence/mongoose/mappers';

@Injectable()
export class MongooseServiceEntryBaseRepository {
  constructor(
    @InjectModel(ServiceEntryDocument.name)
    protected readonly serviceEntryModel: Model<ServiceEntryDocument>,
  ) {}

  protected toDomain(document: ServiceEntryDocument): ServiceEntry | null {
    return MongooseServiceEntryMapper.toDomain(document);
  }

  protected toMongoose(entry: ServiceEntry) {
    return MongooseServiceEntryMapper.toMongoose(entry);
  }
}
