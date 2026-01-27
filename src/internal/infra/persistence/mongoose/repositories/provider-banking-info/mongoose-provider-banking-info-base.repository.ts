import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { ProviderBankingInfo } from '@domain/entities';
import { ProviderBankingInfoDocument } from '@infra/persistence/mongoose/schemas/provider-banking-info/provider-banking-info.schema';
import { MongooseProviderBankingInfoMapper } from '@infra/persistence/mongoose/mappers/provider-banking-info';

@Injectable()
export class MongooseProviderBankingInfoBaseRepository {
  constructor(
    @InjectModel(ProviderBankingInfoDocument.name)
    protected readonly bankingInfoModel: Model<ProviderBankingInfoDocument>,
  ) {}

  protected toDomain(
    document: ProviderBankingInfoDocument,
  ): ProviderBankingInfo {
    return MongooseProviderBankingInfoMapper.toDomain(document);
  }

  protected toMongoose(bankingInfo: ProviderBankingInfo) {
    return MongooseProviderBankingInfoMapper.toMongoose(bankingInfo);
  }
}
