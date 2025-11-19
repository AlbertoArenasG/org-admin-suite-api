import { Injectable } from '@nestjs/common';

import { CustomerFiscalProfile } from '@domain/entities';
import { ICustomerFiscalProfileWriteRepository } from '@domain/ports/repositories';
import { MongooseCustomerFiscalProfileBaseRepository } from './mongoose-customer-fiscal-profile-base.repository';

@Injectable()
export class MongooseCustomerFiscalProfileWriteRepositoryImpl
  extends MongooseCustomerFiscalProfileBaseRepository
  implements ICustomerFiscalProfileWriteRepository
{
  async create(
    profile: CustomerFiscalProfile,
  ): Promise<{ data: CustomerFiscalProfile | null }> {
    const data = this.toMongoose(profile);
    const document = new this.profileModel(data);
    await document.save();

    return {
      data: this.toDomain(document),
    };
  }

  async update(
    profile: CustomerFiscalProfile,
  ): Promise<{ data: CustomerFiscalProfile | null }> {
    const data = this.toMongoose(profile);
    const document = await this.profileModel
      .findOneAndUpdate({ customer_fiscal_profile_id: profile.id }, data, {
        new: true,
      })
      .exec();

    return {
      data: document ? this.toDomain(document) : null,
    };
  }
}
