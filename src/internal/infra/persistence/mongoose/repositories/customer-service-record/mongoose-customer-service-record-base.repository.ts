import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';

import {
  CustomerServiceRecord,
  CustomerServiceRecordMaterializationSource,
  CustomerServiceRecordOperationalStatus,
} from '@domain/entities';
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

  protected buildWorkPriorityPipeline(): PipelineStage[] {
    const openStatuses = [
      CustomerServiceRecordOperationalStatus.PENDING,
      CustomerServiceRecordOperationalStatus.IN_PROGRESS,
    ];
    const materializationSource =
      '$customer_delivery.status_materialization.source';
    const materializationCode =
      '$customer_delivery.status_materialization.code';

    return [
      {
        $addFields: {
          work_priority: {
            $switch: {
              branches: [
                {
                  case: {
                    $and: [
                      { $in: ['$operational_status', openStatuses] },
                      {
                        $eq: [
                          materializationSource,
                          CustomerServiceRecordMaterializationSource.SYSTEM,
                        ],
                      },
                      { $eq: [materializationCode, 'OVERDUE'] },
                    ],
                  },
                  then: 1,
                },
                {
                  case: {
                    $and: [
                      { $in: ['$operational_status', openStatuses] },
                      {
                        $eq: ['$customer_delivery.estimated_delivery_at', null],
                      },
                    ],
                  },
                  then: 2,
                },
                {
                  case: {
                    $and: [
                      { $in: ['$operational_status', openStatuses] },
                      {
                        $eq: [
                          materializationSource,
                          CustomerServiceRecordMaterializationSource.POLICY,
                        ],
                      },
                    ],
                  },
                  then: 3,
                },
                {
                  case: {
                    $and: [
                      { $in: ['$operational_status', openStatuses] },
                      {
                        $ne: ['$customer_delivery.estimated_delivery_at', null],
                      },
                      {
                        $or: [
                          {
                            $eq: [
                              '$customer_delivery.status_materialization',
                              null,
                            ],
                          },
                          {
                            $and: [
                              {
                                $ne: [
                                  materializationSource,
                                  CustomerServiceRecordMaterializationSource.POLICY,
                                ],
                              },
                              {
                                $or: [
                                  {
                                    $ne: [
                                      materializationSource,
                                      CustomerServiceRecordMaterializationSource.SYSTEM,
                                    ],
                                  },
                                  {
                                    $not: [
                                      {
                                        $in: [
                                          materializationCode,
                                          ['OVERDUE', 'ON_TIME'],
                                        ],
                                      },
                                    ],
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  then: 4,
                },
                {
                  case: {
                    $and: [
                      { $in: ['$operational_status', openStatuses] },
                      {
                        $eq: [
                          materializationSource,
                          CustomerServiceRecordMaterializationSource.SYSTEM,
                        ],
                      },
                      { $eq: [materializationCode, 'ON_TIME'] },
                    ],
                  },
                  then: 5,
                },
                {
                  case: {
                    $eq: [
                      '$operational_status',
                      CustomerServiceRecordOperationalStatus.COMPLETED,
                    ],
                  },
                  then: 6,
                },
                {
                  case: {
                    $eq: [
                      '$operational_status',
                      CustomerServiceRecordOperationalStatus.CANCELLED,
                    ],
                  },
                  then: 7,
                },
              ],
              default: 8,
            },
          },
        },
      },
      {
        $sort: {
          work_priority: 1,
          'customer_delivery.estimated_delivery_at': 1,
          createdAt: 1,
          _id: 1,
        },
      },
    ];
  }
}
