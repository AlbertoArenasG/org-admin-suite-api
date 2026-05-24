import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Provider } from '@domain/entities';
import { ProviderDocument } from '@infra/persistence/mongoose/schemas/provider/provider.schema';
import { MongooseProviderMapper } from '@infra/persistence/mongoose/mappers/provider';

@Injectable()
export class MongooseProviderBaseRepository {
  constructor(
    @InjectModel(ProviderDocument.name)
    protected readonly providerModel: Model<ProviderDocument>,
  ) {}

  protected toDomain(document: ProviderDocument): Provider {
    return MongooseProviderMapper.toDomain(document);
  }

  protected toMongoose(provider: Provider) {
    return MongooseProviderMapper.toMongoose(provider);
  }
}
