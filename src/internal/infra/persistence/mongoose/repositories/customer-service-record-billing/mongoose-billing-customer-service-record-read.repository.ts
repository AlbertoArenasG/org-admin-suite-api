import { Injectable } from '@nestjs/common';
import {
  CustomerServiceRecord,
  CustomerServiceRecordBillingStatus,
  CustomerServiceRecordStatus,
} from '@domain/entities';
import {
  FindBillingCustomerServiceRecordsParams,
  IBillingCustomerServiceRecordReadRepository,
} from '@domain/ports/repositories/customer-service-record-billing';
import { buildAccentInsensitiveRegex } from '@src/common/utils';
import { MongooseCustomerServiceRecordBaseRepository } from '../customer-service-record/mongoose-customer-service-record-base.repository';

@Injectable()
export class MongooseBillingCustomerServiceRecordReadRepositoryImpl
  extends MongooseCustomerServiceRecordBaseRepository
  implements IBillingCustomerServiceRecordReadRepository
{
  private readonly visible = [
    CustomerServiceRecordBillingStatus.SUBMITTED,
    CustomerServiceRecordBillingStatus.INVOICED,
  ];

  async findAll(params: FindBillingCustomerServiceRecordsParams) {
    const filter: Record<string, unknown> = {
      status: CustomerServiceRecordStatus.ACTIVE,
      billing_status:
        params.billingStatus && this.visible.includes(params.billingStatus)
          ? params.billingStatus
          : { $in: this.visible },
    };
    if (params.search?.trim()) {
      const expression = {
        $regex: buildAccentInsensitiveRegex(params.search),
        $options: 'i',
      };
      filter.$or = [
        { service_number_display: expression },
        { service_type_name: expression },
        { 'customer.customer_name': expression },
        { 'provider.provider_name': expression },
        { 'assets.name': expression },
        { 'assets.identifier': expression },
        { 'assets.brand': expression },
      ];
    }
    const [documents, total] = await Promise.all([
      this.customerServiceRecordModel
        .find(filter)
        .sort({ createdAt: -1, customer_service_record_id: 1 })
        .skip((params.page - 1) * params.perPage)
        .limit(params.perPage)
        .session(this.transactionContext.getSession() ?? null)
        .exec(),
      this.customerServiceRecordModel
        .countDocuments(filter)
        .session(this.transactionContext.getSession() ?? null)
        .exec(),
    ]);
    return {
      data: documents
        .map((document) => this.toDomain(document))
        .filter((record): record is CustomerServiceRecord => Boolean(record)),
      total,
    };
  }

  async findById(recordId: string) {
    const document = await this.customerServiceRecordModel
      .findOne({
        customer_service_record_id: recordId,
        status: CustomerServiceRecordStatus.ACTIVE,
        billing_status: { $in: this.visible },
      })
      .session(this.transactionContext.getSession() ?? null)
      .exec();
    return { data: this.toDomain(document) };
  }
}
