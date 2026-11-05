import { Injectable } from '@nestjs/common';

import {
  CustomerServiceRecord,
  CustomerServiceRecordBillingStatus,
  CustomerServiceRecordInvoiceStatus,
  CustomerServiceRecordStatus,
} from '@domain/entities';
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
  async markInvoiceOverdueIfCurrent(
    record: CustomerServiceRecord,
    today: string,
  ): Promise<boolean> {
    const result = await this.customerServiceRecordModel
      .updateOne(
        {
          customer_service_record_id: record.id,
          status: CustomerServiceRecordStatus.ACTIVE,
          billing_status: {
            $in: [
              CustomerServiceRecordBillingStatus.SUBMITTED,
              CustomerServiceRecordBillingStatus.INVOICED,
            ],
          },
          invoice_revision: record.invoiceRevision,
          'billing.invoice_status': record.billing.invoiceStatus,
          'billing.estimated_payment_at': {
            $type: 'string',
            $lt: today,
            $eq: record.billing.estimatedPaymentAt,
          },
        },
        {
          $set: {
            'billing.invoice_status':
              CustomerServiceRecordInvoiceStatus.OVERDUE,
          },
          $inc: { invoice_revision: 1 },
        },
        { timestamps: false, session: this.transactionContext.getSession() },
      )
      .exec();
    return result.modifiedCount === 1;
  }
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
        {
          customer_service_record_id: record.id,
          invoice_revision: record.originalInvoiceRevision,
        },
        this.toMongoose(record),
        { new: true, session: this.transactionContext.getSession() },
      )
      .exec();
    return { data: this.toDomain(updated) };
  }

  async updateBillingStatus(
    record: CustomerServiceRecord,
    expectedStatus: CustomerServiceRecordBillingStatus,
  ): Promise<{ data: CustomerServiceRecord | null }> {
    return this.updateBillingFields(record, expectedStatus, true);
  }

  async updateBillingNotification(
    record: CustomerServiceRecord,
    expectedStatus: CustomerServiceRecordBillingStatus,
  ): Promise<{ data: CustomerServiceRecord | null }> {
    return this.updateBillingFields(record, expectedStatus, false);
  }

  async updateBillingInstructions(
    record: CustomerServiceRecord,
  ): Promise<{ data: CustomerServiceRecord | null }> {
    const updated = await this.customerServiceRecordModel
      .findOneAndUpdate(
        {
          customer_service_record_id: record.id,
          status: CustomerServiceRecordStatus.ACTIVE,
        },
        {
          $set: {
            'billing.instructions': record.billing.instructions,
            updated_by: record.updatedBy,
            updatedAt: record.updatedAt,
          },
        },
        {
          new: true,
          timestamps: false,
          session: this.transactionContext.getSession(),
        },
      )
      .exec();
    return { data: this.toDomain(updated) };
  }

  async updateBillingInvoice(
    record: CustomerServiceRecord,
    expectedStatus:
      | CustomerServiceRecordBillingStatus.SUBMITTED
      | CustomerServiceRecordBillingStatus.INVOICED,
  ): Promise<{ data: CustomerServiceRecord | null }> {
    const mapped = MongooseCustomerServiceRecordMapper.toMongoose(record);
    const updated = await this.customerServiceRecordModel
      .findOneAndUpdate(
        {
          customer_service_record_id: record.id,
          status: CustomerServiceRecordStatus.ACTIVE,
          billing_status: expectedStatus,
          invoice_revision: record.originalInvoiceRevision,
        },
        {
          $set: {
            invoice: mapped.invoice,
            invoice_revision: record.invoiceRevision,
            attachments_count: record.attachmentsCount,
            customer_visible_attachments_count:
              record.customerVisibleAttachmentsCount,
            updated_by: record.updatedBy,
            updatedAt: record.updatedAt,
          },
        },
        {
          new: true,
          timestamps: false,
          session: this.transactionContext.getSession(),
        },
      )
      .exec();
    return { data: this.toDomain(updated) };
  }

  async updateBillingLifecycle(
    record: CustomerServiceRecord,
    expectedStatus:
      | CustomerServiceRecordBillingStatus.SUBMITTED
      | CustomerServiceRecordBillingStatus.INVOICED,
  ): Promise<{ data: CustomerServiceRecord | null }> {
    const billing = MongooseCustomerServiceRecordMapper.toMongoose(record)
      .billing as Record<string, unknown>;
    const updated = await this.customerServiceRecordModel
      .findOneAndUpdate(
        {
          customer_service_record_id: record.id,
          status: CustomerServiceRecordStatus.ACTIVE,
          billing_status: expectedStatus,
          invoice_revision: record.originalInvoiceRevision,
        },
        {
          $set: {
            'billing.invoice_status': billing.invoice_status,
            'billing.issued_at': billing.issued_at,
            'billing.delivered_at': billing.delivered_at,
            'billing.payment_term': billing.payment_term,
            'billing.estimated_payment_at': billing.estimated_payment_at,
            'billing.paid_at': billing.paid_at,
            invoice_revision: record.invoiceRevision,
            updated_by: record.updatedBy,
            updatedAt: record.updatedAt,
          },
        },
        {
          new: true,
          timestamps: false,
          session: this.transactionContext.getSession(),
        },
      )
      .exec();
    return { data: this.toDomain(updated) };
  }

  async updateBillingPurchaseOrder(
    record: CustomerServiceRecord,
    expectedStatus:
      | CustomerServiceRecordBillingStatus.SUBMITTED
      | CustomerServiceRecordBillingStatus.INVOICED,
  ): Promise<{ data: CustomerServiceRecord | null }> {
    const mapped = MongooseCustomerServiceRecordMapper.toMongoose(record);
    const updated = await this.customerServiceRecordModel
      .findOneAndUpdate(
        {
          customer_service_record_id: record.id,
          status: CustomerServiceRecordStatus.ACTIVE,
          billing_status: expectedStatus,
          invoice_revision: record.originalInvoiceRevision,
        },
        {
          $set: {
            purchase_order: mapped.purchase_order,
            attachments_count: record.attachmentsCount,
            customer_visible_attachments_count:
              record.customerVisibleAttachmentsCount,
            updated_by: record.updatedBy,
            updatedAt: record.updatedAt,
          },
        },
        {
          new: true,
          timestamps: false,
          session: this.transactionContext.getSession(),
        },
      )
      .exec();
    return { data: this.toDomain(updated) };
  }

  async archiveBillingInvoice(
    record: CustomerServiceRecord,
    expectedStatus:
      | CustomerServiceRecordBillingStatus.SUBMITTED
      | CustomerServiceRecordBillingStatus.INVOICED,
  ): Promise<{ data: CustomerServiceRecord | null }> {
    const mapped = MongooseCustomerServiceRecordMapper.toMongoose(record);
    const billing = mapped.billing as Record<string, unknown>;
    const updated = await this.customerServiceRecordModel
      .findOneAndUpdate(
        {
          customer_service_record_id: record.id,
          status: CustomerServiceRecordStatus.ACTIVE,
          billing_status: expectedStatus,
          invoice_revision: record.originalInvoiceRevision,
        },
        {
          $set: {
            invoice: mapped.invoice,
            'billing.invoice_status': billing.invoice_status,
            'billing.issued_at': billing.issued_at,
            'billing.delivered_at': billing.delivered_at,
            'billing.payment_term': billing.payment_term,
            'billing.estimated_payment_at': billing.estimated_payment_at,
            'billing.paid_at': billing.paid_at,
            invoice_revision: record.invoiceRevision,
            attachments_count: record.attachmentsCount,
            customer_visible_attachments_count:
              record.customerVisibleAttachmentsCount,
            updated_by: record.updatedBy,
            updatedAt: record.updatedAt,
          },
        },
        {
          new: true,
          timestamps: false,
          session: this.transactionContext.getSession(),
        },
      )
      .exec();
    return { data: this.toDomain(updated) };
  }

  private async updateBillingFields(
    record: CustomerServiceRecord,
    expectedStatus: CustomerServiceRecordBillingStatus,
    includeStatus: boolean,
  ): Promise<{ data: CustomerServiceRecord | null }> {
    const fields: Record<string, unknown> = {
      billing_notification:
        MongooseCustomerServiceRecordMapper.toMongooseBillingNotification(
          record.billingNotification,
        ),
      updated_by: record.updatedBy,
      updatedAt: record.updatedAt,
    };
    if (includeStatus) fields.billing_status = record.billingStatus;
    if (includeStatus)
      fields['billing.instructions'] = record.billing.instructions;
    if (
      includeStatus &&
      record.invoiceRevision !== record.originalInvoiceRevision
    ) {
      fields['billing.invoice_status'] = record.billing.invoiceStatus;
      fields.invoice_revision = record.invoiceRevision;
    }

    const updated = await this.customerServiceRecordModel
      .findOneAndUpdate(
        {
          customer_service_record_id: record.id,
          status: CustomerServiceRecordStatus.ACTIVE,
          billing_status: expectedStatus,
          invoice_revision: record.originalInvoiceRevision,
        },
        { $set: fields },
        {
          new: true,
          timestamps: false,
          session: this.transactionContext.getSession(),
        },
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
