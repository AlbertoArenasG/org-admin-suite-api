import { Injectable } from '@nestjs/common';

import {
  CustomerServiceRecord,
  CustomerServiceRecordStatus,
} from '@domain/entities';
import {
  FindCustomerServiceRecordClientAccessParams,
  FindCustomerServiceRecordClientAccessTimelineParams,
  CustomerServiceRecordClientAccessTimelineReadModel,
  ICustomerServiceRecordClientAccessReadRepository,
} from '@domain/ports/repositories';
import { buildAccentInsensitiveRegex } from '@src/common/utils';
import {
  CustomerServiceRecordDocument,
  CustomerServiceRecordStatusMaterializationDocument,
} from '@infra/persistence/mongoose/schemas';
import { MongooseCustomerServiceRecordBaseRepository } from '../customer-service-record/mongoose-customer-service-record-base.repository';

@Injectable()
export class MongooseCustomerServiceRecordClientAccessReadRepositoryImpl
  extends MongooseCustomerServiceRecordBaseRepository
  implements ICustomerServiceRecordClientAccessReadRepository
{
  async findTimeline(
    params: FindCustomerServiceRecordClientAccessTimelineParams,
  ): Promise<{
    data: CustomerServiceRecordClientAccessTimelineReadModel[];
    total: number;
  }> {
    if (!params.isInternalStaff && !params.customerIds.length)
      return { data: [], total: 0 };
    const customerStart = 'customer_delivery.received_at';
    const customerEnd = 'customer_delivery.estimated_delivery_at';
    const inRange = (field: string) => ({
      [field]: { $gte: params.from, $lte: params.to },
    });
    const milestones = [inRange(customerStart), inRange(customerEnd)];
    const filter = {
      ...this.base(
        params.actorUserId,
        params.customerIds,
        params.isInternalStaff,
      ),
      $or:
        params.match === 'customer_milestones'
          ? milestones
          : [
              ...milestones,
              {
                [customerStart]: { $lte: params.to },
                [customerEnd]: { $gte: params.from },
              },
            ],
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

  async findAll(params: FindCustomerServiceRecordClientAccessParams) {
    if (!params.isInternalStaff && !params.customerIds.length)
      return { data: [], total: 0 };
    const filter = this.filter(params);

    if (params.sortStrategy === 'work_priority' && !params.sorts?.length) {
      return this.findAllWithWorkPriority(
        filter,
        (params.page ?? 1) - 1,
        params.perPage ?? 10,
      );
    }

    const [documents, total] = await Promise.all([
      this.customerServiceRecordModel
        .find(filter)
        .sort(this.sort(params))
        .skip(((params.page ?? 1) - 1) * (params.perPage ?? 10))
        .limit(params.perPage ?? 10)
        .exec(),
      this.customerServiceRecordModel.countDocuments(filter).exec(),
    ]);
    return {
      data: documents
        .map((document) => this.toDomain(document))
        .filter((value): value is CustomerServiceRecord => Boolean(value)),
      total,
    };
  }

  private async findAllWithWorkPriority(
    filter: Record<string, unknown>,
    page: number,
    perPage: number,
  ): Promise<{ data: CustomerServiceRecord[]; total: number }> {
    const [documents, total] = await Promise.all([
      this.customerServiceRecordModel
        .aggregate([
          { $match: filter },
          ...this.buildWorkPriorityPipeline(),
          { $skip: page * perPage },
          { $limit: perPage },
          { $project: { work_priority: 0 } },
        ])
        .exec(),
      this.customerServiceRecordModel.countDocuments(filter).exec(),
    ]);
    return {
      data: documents
        .map((document) =>
          this.toDomain(document as CustomerServiceRecordDocument),
        )
        .filter((value): value is CustomerServiceRecord => Boolean(value)),
      total,
    };
  }
  async findById(
    recordId: string,
    actorUserId: string,
    customerIds: string[],
    isInternalStaff: boolean,
  ) {
    if (!isInternalStaff && !customerIds.length) return { data: null };
    return {
      data: this.toDomain(
        await this.customerServiceRecordModel
          .findOne({
            ...this.base(actorUserId, customerIds, isInternalStaff),
            customer_service_record_id: recordId,
          })
          .exec(),
      ),
    };
  }
  async findCustomerOptions(
    params: FindCustomerServiceRecordClientAccessParams,
  ) {
    if (!params.isInternalStaff && !params.customerIds.length) return [];
    const documents = await this.customerServiceRecordModel
      .find(this.filter({ ...params, customerId: null }))
      .select('customer.customer_id customer.customer_name')
      .exec();
    return [
      ...new Map(
        documents.map((item: any) => [
          item.customer.customer_id,
          {
            customerId: item.customer.customer_id,
            name: item.customer.customer_name,
          },
        ]),
      ).values(),
    ].sort(
      (a, b) =>
        a.name.localeCompare(b.name) ||
        a.customerId.localeCompare(b.customerId),
    );
  }
  async findServiceTypeOptions(
    params: FindCustomerServiceRecordClientAccessParams,
  ) {
    if (!params.isInternalStaff && !params.customerIds.length) return [];
    const documents = await this.customerServiceRecordModel
      .find(this.filter({ ...params, serviceTypeCode: null }))
      .select('service_type_code service_type_name')
      .exec();
    return [
      ...new Map(
        documents.map((item: any) => [
          item.service_type_code,
          { code: item.service_type_code, name: item.service_type_name },
        ]),
      ).values(),
    ].sort(
      (a, b) => a.name.localeCompare(b.name) || a.code.localeCompare(b.code),
    );
  }
  private base(
    actorUserId: string,
    customerIds: string[],
    isInternalStaff: boolean,
  ) {
    if (isInternalStaff === true)
      return { status: CustomerServiceRecordStatus.ACTIVE };
    return {
      status: CustomerServiceRecordStatus.ACTIVE,
      'customer.users.user_id': actorUserId,
      'customer.customer_id': { $in: customerIds },
    };
  }
  private filter(
    params: FindCustomerServiceRecordClientAccessParams,
  ): Record<string, unknown> {
    const filter: Record<string, unknown> = this.base(
      params.actorUserId,
      params.customerIds,
      params.isInternalStaff,
    );
    if (params.customerId)
      filter.$and = [{ 'customer.customer_id': params.customerId }];
    if (params.serviceTypeCode)
      filter.service_type_code = params.serviceTypeCode;
    this.range(
      filter,
      'customer_delivery.received_at',
      params.receivedAtFrom,
      params.receivedAtTo,
    );
    this.range(
      filter,
      'customer_delivery.estimated_delivery_at',
      params.estimatedCustomerDeliveryAtFrom,
      params.estimatedCustomerDeliveryAtTo,
    );
    if (params.search?.trim()) {
      const regex = {
        $regex: buildAccentInsensitiveRegex(params.search),
        $options: 'i',
      };
      filter.$or = [
        { service_number_display: regex },
        { service_type_name: regex },
        { 'assets.name': regex },
        { 'assets.identifier': regex },
        { 'assets.brand': regex },
        { 'assets.model': regex },
        { 'assets.serial_number': regex },
      ];
    }
    return filter;
  }
  private range(
    filter: Record<string, unknown>,
    field: string,
    from?: string | null,
    to?: string | null,
  ) {
    if (from || to)
      filter[field] = {
        ...(from ? { $gte: from } : {}),
        ...(to ? { $lte: to } : {}),
      };
  }
  private sort(
    params: FindCustomerServiceRecordClientAccessParams,
  ): Record<string, 1 | -1> {
    const fields: Record<string, string> = {
      service_number: 'service_number',
      received_at: 'customer_delivery.received_at',
      estimated_customer_delivery_at: 'customer_delivery.estimated_delivery_at',
    };
    const sort: Record<string, 1 | -1> = {};
    for (const item of params.sorts ?? [])
      sort[fields[item.field]] = item.direction === 'asc' ? 1 : -1;
    if (!sort.createdAt) sort.createdAt = -1;
    sort.customer_service_record_id = 1;
    return sort;
  }
}
