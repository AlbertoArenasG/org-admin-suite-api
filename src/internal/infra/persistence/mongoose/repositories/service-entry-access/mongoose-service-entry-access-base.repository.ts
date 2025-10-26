import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ServiceEntryAccess } from '@domain/entities';
import { ServiceEntryAccessDocument } from '@infra/persistence/mongoose/schemas';
import { MongooseServiceEntryAccessMapper } from '@infra/persistence/mongoose/mappers';

@Injectable()
export class MongooseServiceEntryAccessBaseRepository {
  constructor(
    @InjectModel(ServiceEntryAccessDocument.name)
    protected readonly accessModel: Model<ServiceEntryAccessDocument>,
  ) {}

  protected toDomain(
    document: ServiceEntryAccessDocument,
  ): ServiceEntryAccess | null {
    return MongooseServiceEntryAccessMapper.toDomain(document);
  }

  protected toMongoose(access: ServiceEntryAccess) {
    return MongooseServiceEntryAccessMapper.toMongoose(access);
  }
}
