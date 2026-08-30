import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CustomerServiceRecordServiceType } from '@domain/entities';
import { MongooseCustomerServiceRecordServiceTypeMapper } from '@infra/persistence/mongoose/mappers/customer-service-record-service-type';
import { CustomerServiceRecordServiceTypeDocument } from '@infra/persistence/mongoose/schemas';
import { MongooseTransactionContext } from '@infra/persistence/mongoose/transactions';

@Injectable()
export class MongooseCustomerServiceRecordServiceTypeBaseRepository {
  constructor(
    @InjectModel(CustomerServiceRecordServiceTypeDocument.name)
    protected readonly customerServiceRecordServiceTypeModel: Model<CustomerServiceRecordServiceTypeDocument>,
    protected readonly transactionContext: MongooseTransactionContext,
  ) {}

  protected toDomain(
    document: CustomerServiceRecordServiceTypeDocument | null,
  ): CustomerServiceRecordServiceType | null {
    return MongooseCustomerServiceRecordServiceTypeMapper.toDomain(document);
  }

  protected toMongoose(serviceType: CustomerServiceRecordServiceType) {
    return MongooseCustomerServiceRecordServiceTypeMapper.toMongoose(
      serviceType,
    );
  }
}
