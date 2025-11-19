import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CustomerFiscalProfile } from '@domain/entities';
import { CustomerFiscalProfileDocument } from '@infra/persistence/mongoose/schemas';
import { MongooseCustomerFiscalProfileMapper } from '@infra/persistence/mongoose/mappers';

@Injectable()
export class MongooseCustomerFiscalProfileBaseRepository {
  constructor(
    @InjectModel(CustomerFiscalProfileDocument.name)
    protected readonly profileModel: Model<CustomerFiscalProfileDocument>,
  ) {}

  protected toDomain(
    document: CustomerFiscalProfileDocument,
  ): CustomerFiscalProfile | null {
    return MongooseCustomerFiscalProfileMapper.toDomain(document);
  }

  protected toMongoose(profile: CustomerFiscalProfile) {
    return MongooseCustomerFiscalProfileMapper.toMongoose(profile);
  }
}
