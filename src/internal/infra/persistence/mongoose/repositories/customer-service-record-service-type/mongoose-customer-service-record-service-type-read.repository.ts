import { Injectable } from '@nestjs/common';

import {
  CustomerServiceRecordServiceType,
  CustomerServiceRecordServiceTypeStatus,
} from '@domain/entities';
import { ICustomerServiceRecordServiceTypeReadRepository } from '@domain/ports/repositories';
import { MongooseCustomerServiceRecordServiceTypeBaseRepository } from './mongoose-customer-service-record-service-type-base.repository';

@Injectable()
export class MongooseCustomerServiceRecordServiceTypeReadRepositoryImpl
  extends MongooseCustomerServiceRecordServiceTypeBaseRepository
  implements ICustomerServiceRecordServiceTypeReadRepository
{
  async findById(
    serviceTypeId: string,
  ): Promise<{ data: CustomerServiceRecordServiceType | null }> {
    const document = await this.customerServiceRecordServiceTypeModel
      .findOne({ customer_service_record_service_type_id: serviceTypeId })
      .session(this.transactionContext.getSession() ?? null)
      .exec();
    return { data: this.toDomain(document) };
  }

  async findByCode(
    code: string,
  ): Promise<{ data: CustomerServiceRecordServiceType | null }> {
    const document = await this.customerServiceRecordServiceTypeModel
      .findOne({ code })
      .session(this.transactionContext.getSession() ?? null)
      .exec();
    return { data: this.toDomain(document) };
  }

  async findAll(input: {
    page: number;
    perPage: number;
    status?: string | null;
  }): Promise<{ data: CustomerServiceRecordServiceType[]; total: number }> {
    const filter = input.status ? { status: input.status } : {};
    const [documents, total] = await Promise.all([
      this.customerServiceRecordServiceTypeModel
        .find(filter)
        .sort({ name: 1 })
        .skip((input.page - 1) * input.perPage)
        .limit(input.perPage)
        .session(this.transactionContext.getSession() ?? null)
        .exec(),
      this.customerServiceRecordServiceTypeModel
        .countDocuments(filter)
        .session(this.transactionContext.getSession() ?? null)
        .exec(),
    ]);
    return {
      data: documents
        .map((document) => this.toDomain(document))
        .filter((item): item is CustomerServiceRecordServiceType =>
          Boolean(item),
        ),
      total,
    };
  }

  async findActive(): Promise<{ data: CustomerServiceRecordServiceType[] }> {
    const documents = await this.customerServiceRecordServiceTypeModel
      .find({ status: CustomerServiceRecordServiceTypeStatus.ACTIVE })
      .sort({ name: 1 })
      .session(this.transactionContext.getSession() ?? null)
      .exec();
    return {
      data: documents
        .map((document) => this.toDomain(document))
        .filter((item): item is CustomerServiceRecordServiceType =>
          Boolean(item),
        ),
    };
  }
}
