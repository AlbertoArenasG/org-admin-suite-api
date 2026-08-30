import { Injectable } from '@nestjs/common';

import { CustomerServiceRecord } from '@domain/entities';
import {
  ICustomerServiceRecordWriteRepository,
  UpdateCustomerServiceRecordMaterializationsParams,
} from '@domain/ports/repositories';
import { MongooseCustomerServiceRecordMapper } from '@infra/persistence/mongoose/mappers/customer-service-record';
import { MongooseCustomerServiceRecordBaseRepository } from './mongoose-customer-service-record-base.repository';

@Injectable()
export class MongooseCustomerServiceRecordWriteRepositoryImpl
  extends MongooseCustomerServiceRecordBaseRepository
  implements ICustomerServiceRecordWriteRepository
{
  async create(
    record: CustomerServiceRecord,
  ): Promise<{ data: CustomerServiceRecord | null }> {
    const entity = new this.customerServiceRecordModel({
      customer_service_record_id: record.id,
      ...this.toMongoose(record),
    });
    await entity.save({ session: this.transactionContext.getSession() });
    return { data: this.toDomain(entity) };
  }

  async update(
    record: CustomerServiceRecord,
  ): Promise<{ data: CustomerServiceRecord | null }> {
    const updated = await this.customerServiceRecordModel
      .findOneAndUpdate(
        { customer_service_record_id: record.id },
        this.toMongoose(record),
        { new: true, session: this.transactionContext.getSession() },
      )
      .exec();
    return { data: this.toDomain(updated) };
  }

  async updateMaterializations(
    params: UpdateCustomerServiceRecordMaterializationsParams,
  ): Promise<{ updated: boolean }> {
    const fields: Record<string, unknown> = {};
    if (params.customerDelivery?.statusMaterialization !== undefined)
      fields['customer_delivery.status_materialization'] =
        MongooseCustomerServiceRecordMapper.toMongooseStatusMaterialization(
          params.customerDelivery.statusMaterialization,
        );
    if (params.customerDelivery?.notificationMaterialization !== undefined)
      fields['customer_delivery.notification_materialization'] =
        MongooseCustomerServiceRecordMapper.toMongooseNotificationMaterialization(
          params.customerDelivery.notificationMaterialization,
        );
    if (params.provider?.statusMaterialization !== undefined)
      fields['provider.status_materialization'] =
        MongooseCustomerServiceRecordMapper.toMongooseStatusMaterialization(
          params.provider.statusMaterialization,
        );
    if (params.provider?.notificationMaterialization !== undefined)
      fields['provider.notification_materialization'] =
        MongooseCustomerServiceRecordMapper.toMongooseNotificationMaterialization(
          params.provider.notificationMaterialization,
        );
    if (params.provider?.followUpMaterialization !== undefined)
      fields['provider.follow_up_materialization'] =
        params.provider.followUpMaterialization.map((item) => ({
          source: item.source,
          source_rule_id: item.sourceRuleId,
          trigger_date: item.triggerDate,
          status: item.status,
          triggered_at: item.triggeredAt,
          failure_reason: item.failureReason,
          last_materialized_at: item.lastMaterializedAt,
        }));
    if (Object.keys(fields).length === 0)
      throw new Error('At least one materialization field is required');
    const result = await this.customerServiceRecordModel.collection.updateOne(
      { customer_service_record_id: params.recordId },
      { $set: fields },
      { session: this.transactionContext.getSession() ?? undefined },
    );
    return { updated: result.matchedCount > 0 };
  }
}
