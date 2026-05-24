import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { ProviderFiscalProfile } from '@domain/entities';
import { ProviderFiscalProfileDocument } from '@infra/persistence/mongoose/schemas/provider-fiscal-profile/provider-fiscal-profile.schema';
import { MongooseProviderFiscalProfileMapper } from '@infra/persistence/mongoose/mappers/provider-fiscal-profile';

@Injectable()
export class MongooseProviderFiscalProfileBaseRepository {
  constructor(
    @InjectModel(ProviderFiscalProfileDocument.name)
    protected readonly profileModel: Model<ProviderFiscalProfileDocument>,
  ) {}

  protected toDomain(
    document: ProviderFiscalProfileDocument,
  ): ProviderFiscalProfile {
    return MongooseProviderFiscalProfileMapper.toDomain(document);
  }

  protected toMongoose(profile: ProviderFiscalProfile) {
    return MongooseProviderFiscalProfileMapper.toMongoose(profile);
  }
}
