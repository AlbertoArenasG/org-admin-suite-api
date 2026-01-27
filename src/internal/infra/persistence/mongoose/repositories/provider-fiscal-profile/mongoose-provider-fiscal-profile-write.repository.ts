import { Injectable } from '@nestjs/common';

import { ProviderFiscalProfile } from '@domain/entities';
import { IProviderFiscalProfileWriteRepository } from '@domain/ports/repositories';
import { MongooseProviderFiscalProfileBaseRepository } from './mongoose-provider-fiscal-profile-base.repository';

@Injectable()
export class MongooseProviderFiscalProfileWriteRepositoryImpl
  extends MongooseProviderFiscalProfileBaseRepository
  implements IProviderFiscalProfileWriteRepository
{
  async create(
    profile: ProviderFiscalProfile,
  ): Promise<{ data: ProviderFiscalProfile | null }> {
    const data = this.toMongoose(profile);
    const entity = new this.profileModel(data);
    await entity.save();
    return {
      data: this.toDomain(entity),
    };
  }

  async update(
    profile: ProviderFiscalProfile,
  ): Promise<{ data: ProviderFiscalProfile | null }> {
    const data = this.toMongoose(profile);

    const updated = await this.profileModel
      .findOneAndUpdate({ provider_fiscal_profile_id: profile.id }, data, {
        new: true,
      })
      .exec();

    return {
      data: updated ? this.toDomain(updated) : null,
    };
  }
}
