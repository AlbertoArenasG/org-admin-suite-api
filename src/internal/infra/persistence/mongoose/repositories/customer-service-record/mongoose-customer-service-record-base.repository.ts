import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CustomerServiceRecord } from '@domain/entities';
import { MongooseCustomerServiceRecordMapper } from '@infra/persistence/mongoose/mappers/customer-service-record';
import { CustomerServiceRecordDocument } from '@infra/persistence/mongoose/schemas';
import { MongooseTransactionContext } from '@infra/persistence/mongoose/transactions';

@Injectable()
export class MongooseCustomerServiceRecordBaseRepository {
  constructor(
    @InjectModel(CustomerServiceRecordDocument.name)
    protected readonly customerServiceRecordModel: Model<CustomerServiceRecordDocument>,
    protected readonly transactionContext: MongooseTransactionContext,
  ) {}

  protected toDomain(
    document: CustomerServiceRecordDocument | null,
  ): CustomerServiceRecord | null {
    return MongooseCustomerServiceRecordMapper.toDomain(document);
  }

  protected toMongoose(record: CustomerServiceRecord) {
    return MongooseCustomerServiceRecordMapper.toMongoose(record);
  }
}
