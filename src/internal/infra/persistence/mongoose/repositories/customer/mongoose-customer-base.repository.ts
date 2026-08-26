import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Customer } from '@domain/entities';
import { CustomerDocument } from '@infra/persistence/mongoose/schemas';
import { MongooseCustomerMapper } from '@infra/persistence/mongoose/mappers';
import { MongooseTransactionContext } from '@infra/persistence/mongoose/transactions';

@Injectable()
export class MongooseCustomerBaseRepository {
  constructor(
    @InjectModel(CustomerDocument.name)
    protected readonly customerModel: Model<CustomerDocument>,
    protected readonly transactionContext: MongooseTransactionContext,
  ) {}

  protected toDomain(document: CustomerDocument): Customer | null {
    return MongooseCustomerMapper.toDomain(document);
  }

  protected toMongoose(customer: Customer) {
    return MongooseCustomerMapper.toMongoose(customer);
  }
}
