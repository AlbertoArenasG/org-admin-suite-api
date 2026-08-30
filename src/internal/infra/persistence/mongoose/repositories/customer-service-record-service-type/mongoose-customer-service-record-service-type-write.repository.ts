import { Injectable } from '@nestjs/common';

import { CustomerServiceRecordServiceType } from '@domain/entities';
import { ICustomerServiceRecordServiceTypeWriteRepository } from '@domain/ports/repositories';
import { MongooseCustomerServiceRecordServiceTypeBaseRepository } from './mongoose-customer-service-record-service-type-base.repository';

@Injectable()
export class MongooseCustomerServiceRecordServiceTypeWriteRepositoryImpl
  extends MongooseCustomerServiceRecordServiceTypeBaseRepository
  implements ICustomerServiceRecordServiceTypeWriteRepository
{
  async create(
    serviceType: CustomerServiceRecordServiceType,
  ): Promise<{ data: CustomerServiceRecordServiceType | null }> {
    const entity = new this.customerServiceRecordServiceTypeModel({
      customer_service_record_service_type_id: serviceType.id,
      ...this.toMongoose(serviceType),
    });
    await entity.save({ session: this.transactionContext.getSession() });
    return { data: this.toDomain(entity) };
  }

  async update(
    serviceType: CustomerServiceRecordServiceType,
  ): Promise<{ data: CustomerServiceRecordServiceType | null }> {
    const updated = await this.customerServiceRecordServiceTypeModel
      .findOneAndUpdate(
        { customer_service_record_service_type_id: serviceType.id },
        this.toMongoose(serviceType),
        { new: true, session: this.transactionContext.getSession() },
      )
      .exec();
    return { data: this.toDomain(updated) };
  }
}
