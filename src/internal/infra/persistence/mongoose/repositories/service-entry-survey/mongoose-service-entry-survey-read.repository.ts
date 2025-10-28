import { Injectable } from '@nestjs/common';
import { PipelineStage } from 'mongoose';

import {
  IServiceEntrySurveyReadRepository,
  FindServiceEntrySurveysParams,
} from '@domain/ports/repositories';
import { ServiceEntrySurvey, ServiceEntryStatus } from '@domain/entities';
import { ServiceEntrySurveyDocument } from '@infra/persistence/mongoose/schemas';
import { MongooseServiceEntrySurveyBaseRepository } from './mongoose-service-entry-survey-base.repository';

@Injectable()
export class MongooseServiceEntrySurveyReadRepositoryImpl
  extends MongooseServiceEntrySurveyBaseRepository
  implements IServiceEntrySurveyReadRepository
{
  async findByAccessId(
    accessId: string,
  ): Promise<{ data: ServiceEntrySurvey | null }> {
    const document = await this.surveyModel
      .findOne({ access_id: accessId })
      .exec();

    return {
      data: document ? this.toDomain(document) : null,
    };
  }

  async findByServiceEntryId(
    serviceEntryId: string,
  ): Promise<{ data: ServiceEntrySurvey | null }> {
    const document = await this.surveyModel
      .findOne({ service_entry_id: serviceEntryId })
      .exec();

    return {
      data: document ? this.toDomain(document) : null,
    };
  }

  async findByServiceEntryIds(
    serviceEntryIds: string[],
  ): Promise<{ data: ServiceEntrySurvey[] }> {
    if (!serviceEntryIds || serviceEntryIds.length === 0) {
      return { data: [] };
    }

    const documents = await this.surveyModel
      .find({ service_entry_id: { $in: serviceEntryIds } })
      .exec();

    return {
      data: documents
        .map((document) => this.toDomain(document))
        .filter((survey): survey is ServiceEntrySurvey => survey !== null),
    };
  }

  async findAll(
    params: FindServiceEntrySurveysParams,
  ): Promise<{ data: ServiceEntrySurvey[]; total: number }> {
    const filter: Record<string, unknown> = {};

    if (params.from || params.to) {
      filter.createdAt = {};
      if (params.from) {
        filter.createdAt['$gte'] = params.from;
      }
      if (params.to) {
        filter.createdAt['$lte'] = params.to;
      }
    }

    if (params.serviceEntryIds && params.serviceEntryIds.length > 0) {
      filter.service_entry_id = { $in: params.serviceEntryIds };
    }

    if (params.templateId) {
      filter.template_id = params.templateId;
    }

    if (
      params.templateVersion !== undefined &&
      params.templateVersion !== null
    ) {
      filter.template_version = params.templateVersion;
    }

    const pipeline: PipelineStage[] = [
      { $match: filter },
      {
        $lookup: {
          from: 'service_entries',
          localField: 'service_entry_id',
          foreignField: 'service_entry_id',
          as: 'service_entry',
        },
      },
      { $unwind: '$service_entry' },
      {
        $match: {
          'service_entry.status': { $ne: ServiceEntryStatus.DELETED },
        },
      },
    ];

    const [totalResult] = await this.surveyModel
      .aggregate([...pipeline, { $count: 'count' }])
      .exec();

    const total = totalResult?.count ?? 0;

    const dataPipeline: PipelineStage[] = [...pipeline];

    if (params.page && params.perPage) {
      const skip = (params.page - 1) * params.perPage;
      dataPipeline.push({ $skip: skip }, { $limit: params.perPage });
    }

    dataPipeline.push({ $project: { service_entry: 0 } });

    const documents = await this.surveyModel.aggregate(dataPipeline).exec();

    return {
      data: documents
        .map((document) =>
          this.toDomain(document as unknown as ServiceEntrySurveyDocument),
        )
        .filter((survey): survey is ServiceEntrySurvey => survey !== null),
      total,
    };
  }
}
