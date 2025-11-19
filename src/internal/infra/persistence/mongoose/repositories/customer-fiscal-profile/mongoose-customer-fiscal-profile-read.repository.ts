import { Injectable } from '@nestjs/common';

import { ICustomerFiscalProfileReadRepository } from '@domain/ports/repositories';
import { CustomerFiscalProfile } from '@domain/entities';
import { MongooseCustomerFiscalProfileBaseRepository } from './mongoose-customer-fiscal-profile-base.repository';

@Injectable()
export class MongooseCustomerFiscalProfileReadRepositoryImpl
  extends MongooseCustomerFiscalProfileBaseRepository
  implements ICustomerFiscalProfileReadRepository
{
  async findById(id: string): Promise<{ data: CustomerFiscalProfile | null }> {
    const document = await this.profileModel
      .findOne({ customer_fiscal_profile_id: id })
      .exec();

    return { data: document ? this.toDomain(document) : null };
  }

  async findByCustomerId(
    customerId: string,
  ): Promise<{ data: CustomerFiscalProfile | null }> {
    const document = await this.profileModel
      .findOne({ customer_id: customerId })
      .exec();

    return { data: document ? this.toDomain(document) : null };
  }

  async findByCustomerIds(
    customerIds: string[],
  ): Promise<{ data: CustomerFiscalProfile[] }> {
    if (!customerIds.length) {
      return { data: [] };
    }

    const documents = await this.profileModel
      .find({ customer_id: { $in: customerIds } })
      .exec();

    return {
      data: documents
        .map((document) => this.toDomain(document))
        .filter(
          (profile): profile is CustomerFiscalProfile => profile !== null,
        ),
    };
  }
}
