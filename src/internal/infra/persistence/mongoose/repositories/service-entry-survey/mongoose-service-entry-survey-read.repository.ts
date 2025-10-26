import { Injectable } from '@nestjs/common';

import {
  IServiceEntrySurveyReadRepository,
  FindServiceEntrySurveysParams,
} from '@domain/ports/repositories';
import { ServiceEntrySurvey } from '@domain/entities';
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

  async findAll(
    params: FindServiceEntrySurveysParams,
  ): Promise<{ data: ServiceEntrySurvey[] }> {
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

    const documents = await this.surveyModel.find(filter).exec();

    return {
      data: documents
        .map((document) => this.toDomain(document))
        .filter((survey): survey is ServiceEntrySurvey => survey !== null),
    };
  }
}
