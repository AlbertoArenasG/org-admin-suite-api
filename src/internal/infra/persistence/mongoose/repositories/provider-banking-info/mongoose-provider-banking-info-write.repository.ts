import { Injectable } from '@nestjs/common';

import { ProviderBankingInfo } from '@domain/entities';
import { IProviderBankingInfoWriteRepository } from '@domain/ports/repositories';
import { MongooseProviderBankingInfoBaseRepository } from './mongoose-provider-banking-info-base.repository';

@Injectable()
export class MongooseProviderBankingInfoWriteRepositoryImpl
  extends MongooseProviderBankingInfoBaseRepository
  implements IProviderBankingInfoWriteRepository
{
  async create(
    bankingInfo: ProviderBankingInfo,
  ): Promise<{ data: ProviderBankingInfo | null }> {
    const data = this.toMongoose(bankingInfo);
    const entity = new this.bankingInfoModel(data);
    await entity.save();
    return {
      data: this.toDomain(entity),
    };
  }

  async update(
    bankingInfo: ProviderBankingInfo,
  ): Promise<{ data: ProviderBankingInfo | null }> {
    const data = this.toMongoose(bankingInfo);

    const updated = await this.bankingInfoModel
      .findOneAndUpdate({ provider_banking_info_id: bankingInfo.id }, data, {
        new: true,
      })
      .exec();

    return {
      data: updated ? this.toDomain(updated) : null,
    };
  }
}
