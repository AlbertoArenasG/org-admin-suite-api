import { Injectable } from '@nestjs/common';

import {
  CustomerServiceRecord,
  CustomerServiceRecordOperationalStatus,
  CustomerServiceRecordStatus,
} from '@domain/entities';
import {
  FindCustomerServiceRecordsParams,
  FindOperationalCustomerServiceRecordsParams,
  ICustomerServiceRecordReadRepository,
} from '@domain/ports/repositories';
import { MongooseCustomerServiceRecordBaseRepository } from './mongoose-customer-service-record-base.repository';

@Injectable()
export class MongooseCustomerServiceRecordReadRepositoryImpl
  extends MongooseCustomerServiceRecordBaseRepository
  implements ICustomerServiceRecordReadRepository
{
  async findById(
    recordId: string,
  ): Promise<{ data: CustomerServiceRecord | null }> {
    const document = await this.customerServiceRecordModel
      .findOne({
        customer_service_record_id: recordId,
        status: CustomerServiceRecordStatus.ACTIVE,
      })
      .session(this.transactionContext.getSession() ?? null)
      .exec();
    return { data: this.toDomain(document) };
  }

  async findAll(
    params: FindCustomerServiceRecordsParams,
  ): Promise<{ data: CustomerServiceRecord[]; total: number }> {
    const filter = this.buildFilter(params);
    const skip = (params.page - 1) * params.perPage;
    const [documents, total] = await Promise.all([
      this.customerServiceRecordModel
        .find(filter)
        .sort(this.buildSort(params))
        .skip(skip)
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

  async findOperational(
    params: FindOperationalCustomerServiceRecordsParams,
  ): Promise<{ data: CustomerServiceRecord[] }> {
    const filter: Record<string, unknown> = {
      status: CustomerServiceRecordStatus.ACTIVE,
      operational_status: {
        $in: [
          CustomerServiceRecordOperationalStatus.PENDING,
          CustomerServiceRecordOperationalStatus.IN_PROGRESS,
        ],
      },
    };
    const prefix =
      params.commitment === 'PROVIDER_RETURN'
        ? 'provider'
        : 'customer_delivery';
    if (params.statusPolicyId)
      filter[`${prefix}.status_policy_id`] = params.statusPolicyId;
    if (params.notificationPolicyId)
      filter[`${prefix}.notification_policy_id`] = params.notificationPolicyId;
    if (params.after) {
      filter.$or = [
        { createdAt: { $gt: params.after.createdAt } },
        {
          createdAt: params.after.createdAt,
          customer_service_record_id: { $gt: params.after.recordId },
        },
      ];
    }
    const documents = await this.customerServiceRecordModel
      .find(filter)
      .sort({ createdAt: 1, customer_service_record_id: 1 })
      .limit(params.limit)
      .session(this.transactionContext.getSession() ?? null)
      .exec();
    return {
      data: documents
        .map((document) => this.toDomain(document))
        .filter((record): record is CustomerServiceRecord => Boolean(record)),
    };
  }

  private buildFilter(
    params: FindCustomerServiceRecordsParams,
  ): Record<string, unknown> {
    const filter: Record<string, unknown> = {
      status: CustomerServiceRecordStatus.ACTIVE,
    };
    if (params.search?.trim()) {
      const expression = { $regex: escapeRegex(params.search), $options: 'i' };
      const serviceNumber = Number(params.search);
      filter.$or = [
        { service_type_name: expression },
        { 'customer.customer_name': expression },
        { 'provider.provider_name': expression },
        { 'assets.name': expression },
        { 'assets.identifier': expression },
        { 'assets.brand': expression },
        ...(Number.isInteger(serviceNumber)
          ? [{ service_number: serviceNumber }]
          : []),
      ];
    }
    if (params.operationalStatus)
      filter.operational_status = params.operationalStatus;
    if (params.serviceTypeCode)
      filter.service_type_code = params.serviceTypeCode;
    if (params.customerId) filter['customer.customer_id'] = params.customerId;
    if (params.customerUserId)
      filter['customer.users.user_id'] = params.customerUserId;
    if (params.providerId) filter['provider.provider_id'] = params.providerId;
    if (typeof params.hasProvider === 'boolean')
      filter['provider.provider_id'] = params.hasProvider
        ? { $ne: null }
        : { $exists: false };
    this.addRange(
      filter,
      'requested_at',
      params.requestedAtFrom,
      params.requestedAtTo,
    );
    this.addRange(
      filter,
      'customer_delivery.received_at',
      params.receivedAtFrom,
      params.receivedAtTo,
    );
    this.addRange(
      filter,
      'customer_delivery.estimated_delivery_at',
      params.estimatedCustomerDeliveryAtFrom,
      params.estimatedCustomerDeliveryAtTo,
    );
    this.addRange(
      filter,
      'provider.estimated_return_at',
      params.providerEstimatedReturnAtFrom,
      params.providerEstimatedReturnAtTo,
    );
    return filter;
  }

  private addRange(
    filter: Record<string, unknown>,
    field: string,
    from?: string | null,
    to?: string | null,
  ): void {
    if (from || to)
      filter[field] = {
        ...(from ? { $gte: from } : {}),
        ...(to ? { $lte: to } : {}),
      };
  }

  private buildSort(
    params: FindCustomerServiceRecordsParams,
  ): Record<string, 1 | -1> {
    const mapping: Record<string, string> = {
      service_number: 'service_number',
      requested_at: 'requested_at',
      received_at: 'customer_delivery.received_at',
      estimated_customer_delivery_at: 'customer_delivery.estimated_delivery_at',
      provider_estimated_return_at: 'provider.estimated_return_at',
      operational_status: 'operational_status',
      created_at: 'createdAt',
    };
    const result: Record<string, 1 | -1> = {};
    for (const sort of params.sorts ?? [])
      result[mapping[sort.field] ?? 'createdAt'] =
        sort.direction === 'asc' ? 1 : -1;
    if (!result.createdAt) result.createdAt = -1;
    return result;
  }
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
