import { Injectable } from '@nestjs/common';

import { Customer } from '@domain/entities';
import { ICustomerWriteRepository } from '@domain/ports/repositories';
import { MongooseCustomerBaseRepository } from './mongoose-customer-base.repository';

@Injectable()
export class MongooseCustomerWriteRepositoryImpl
  extends MongooseCustomerBaseRepository
  implements ICustomerWriteRepository
{
  async create(customer: Customer): Promise<{ data: Customer | null }> {
    const document = new this.customerModel(this.toMongoose(customer));
    await document.save();

    return { data: this.toDomain(document) };
  }

  async update(customer: Customer): Promise<{ data: Customer | null }> {
    const document = await this.customerModel
      .findOneAndUpdate(
        { customer_id: customer.id },
        this.toMongoose(customer),
        { new: true },
      )
      .exec();

    return {
      data: document ? this.toDomain(document) : null,
    };
  }
}
