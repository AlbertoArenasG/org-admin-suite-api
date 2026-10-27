import { Injectable } from '@nestjs/common';

import {
  CustomerServiceRecord,
  CustomerServiceRecordOperationalStatus,
  CustomerServiceRecordStatus,
} from '@domain/entities';
import {
  FindCustomerServiceRecordsParams,
  FindCustomerServiceRecordTimelineParams,
  FindOperationalCustomerServiceRecordsParams,
  ICustomerServiceRecordReadRepository,
  CustomerServiceRecordTimelineReadModel,
} from '@domain/ports/repositories';
import { buildAccentInsensitiveRegex } from '@src/common/utils';
import {
  CustomerServiceRecordDocument,
  CustomerServiceRecordStatusMaterializationDocument,
} from '@infra/persistence/mongoose/schemas';
import { MongooseCustomerServiceRecordBaseRepository } from './mongoose-customer-service-record-base.repository';

@Injectable()
export class MongooseCustomerServiceRecordReadRepositoryImpl
  extends MongooseCustomerServiceRecordBaseRepository
  implements ICustomerServiceRecordReadRepository
{
  async findTimeline(params: FindCustomerServiceRecordTimelineParams): Promise<{
    data: CustomerServiceRecordTimelineReadModel[];
    total: number;
  }> {
    const inRange = (field: string) => ({
      [field]: { $gte: params.from, $lte: params.to },
    });
    const crosses = (start: string, end: string) => ({
      [start]: { $lte: params.to },
      [end]: { $gte: params.from },
    });
    const customerStart = 'customer_delivery.received_at';
    const customerEnd = 'customer_delivery.estimated_delivery_at';
    const providerStart = 'provider.delivered_to_provider_at';
    const providerRealEnd = 'provider.returned_from_provider_at';
    const providerEstimatedEnd = 'provider.estimated_return_at';
    const customerMilestones = [inRange(customerStart), inRange(customerEnd)];
    const providerReal = { [providerRealEnd]: { $type: 'string' } };
    const providerEstimated = { [providerRealEnd]: null };
    const periodBranches: Record<string, unknown>[] = [
      ...customerMilestones,
      crosses(customerStart, customerEnd),
      { $and: [providerReal, inRange(providerStart)] },
      { $and: [providerReal, inRange(providerRealEnd)] },
      { $and: [providerReal, crosses(providerStart, providerRealEnd)] },
      { $and: [providerEstimated, inRange(providerStart)] },
      { $and: [providerEstimated, inRange(providerEstimatedEnd)] },
      {
        $and: [providerEstimated, crosses(providerStart, providerEstimatedEnd)],
      },
    ];
    const filter = {
      status: CustomerServiceRecordStatus.ACTIVE,
      $or:
        params.match === 'customer_milestones'
          ? customerMilestones
          : periodBranches,
    };
    const fields = [
      'customer_service_record_id',
      'service_number',
      'service_type_code',
      'service_type_name',
      'requested_at',
      'customer.customer_id',
      'customer.customer_name',
      'assets.asset_id',
      'assets.name',
      'assets.identifier',
      'operational_status',
      customerStart,
      customerEnd,
      'customer_delivery.status_materialization.source',
      'customer_delivery.status_materialization.code',
      'customer_delivery.status_materialization.label',
      'customer_delivery.status_materialization.label_key',
      'customer_delivery.status_materialization.color_hex',
      'customer_delivery.status_materialization.effective_start_date',
      'provider.provider_id',
      'provider.provider_name',
      providerStart,
      providerEstimatedEnd,
      providerRealEnd,
      'provider.status_materialization.source',
      'provider.status_materialization.code',
      'provider.status_materialization.label',
      'provider.status_materialization.label_key',
      'provider.status_materialization.color_hex',
      'provider.status_materialization.effective_start_date',
    ];
    const session = this.transactionContext.getSession() ?? null;
    const [documents, total] = await Promise.all([
      this.customerServiceRecordModel
        .find(filter)
        .select(fields.join(' '))
        .sort({ customer_service_record_id: 1 })
        .skip((params.page - 1) * params.perPage)
        .limit(params.perPage)
        .session(session)
        .lean()
        .exec(),
      this.customerServiceRecordModel
        .countDocuments(filter)
        .session(session)
        .exec(),
    ]);
    return {
      data: documents.map((document) => ({
        id: document.customer_service_record_id,
        serviceNumber: document.service_number,
        serviceTypeCode: document.service_type_code,
        serviceTypeName: document.service_type_name,
        requestedAt: document.requested_at,
        customer: {
          customerId: document.customer.customer_id,
          name: document.customer.customer_name,
        },
        assets: (document.assets ?? []).map((asset) => ({
          assetId: asset.asset_id,
          name: asset.name,
          identifier: asset.identifier,
        })),
        operationalStatus: document.operational_status,
        customerDelivery: {
          receivedAt: document.customer_delivery.received_at ?? null,
          estimatedDeliveryAt:
            document.customer_delivery.estimated_delivery_at ?? null,
          statusMaterialization: this.toTimelineMaterialization(
            document.customer_delivery.status_materialization,
          ),
        },
        provider: document.provider
          ? {
              providerId: document.provider.provider_id,
              name: document.provider.provider_name,
              deliveredToProviderAt:
                document.provider.delivered_to_provider_at ?? null,
              estimatedReturnAt: document.provider.estimated_return_at ?? null,
              returnedFromProviderAt:
                document.provider.returned_from_provider_at ?? null,
              statusMaterialization: this.toTimelineMaterialization(
                document.provider.status_materialization,
              ),
            }
          : null,
      })),
      total,
    };
  }

  private toTimelineMaterialization(
    value?: CustomerServiceRecordStatusMaterializationDocument | null,
  ) {
    if (!value) return null;
    return {
      source: value.source,
      code: value.code,
      label: value.label,
      labelKey: value.label_key ?? null,
      colorHex: value.color_hex,
      effectiveStartDate: value.effective_start_date ?? null,
    };
  }
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

    if (params.sortStrategy === 'work_priority' && params.sorts.length === 0) {
      return this.findAllWithWorkPriority(filter, skip, params.perPage);
    }

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

  private async findAllWithWorkPriority(
    filter: Record<string, unknown>,
    skip: number,
    perPage: number,
  ): Promise<{ data: CustomerServiceRecord[]; total: number }> {
    const [documents, total] = await Promise.all([
      this.customerServiceRecordModel
        .aggregate([
          { $match: filter },
          ...this.buildWorkPriorityPipeline(),
          { $skip: skip },
          { $limit: perPage },
          { $project: { work_priority: 0 } },
        ])
        .session(this.transactionContext.getSession() ?? null)
        .exec(),
      this.customerServiceRecordModel
        .countDocuments(filter)
        .session(this.transactionContext.getSession() ?? null)
        .exec(),
    ]);

    return {
      data: documents
        .map((document) =>
          this.toDomain(document as CustomerServiceRecordDocument),
        )
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
    if (params.operationalStatus)
      filter.operational_status = params.operationalStatus;
    if (params.billingStatus) filter.billing_status = params.billingStatus;
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
