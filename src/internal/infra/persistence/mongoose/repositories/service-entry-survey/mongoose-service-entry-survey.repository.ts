import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ServiceEntrySurvey } from '@domain/entities';
import { IServiceEntrySurveyRepository } from '@domain/ports/repositories';
import { ServiceEntrySurveyDocument } from '@infra/persistence/mongoose/schemas';
import { MongooseServiceEntrySurveyMapper } from '@infra/persistence/mongoose/mappers';

@Injectable()
export class MongooseServiceEntrySurveyRepositoryImpl
  implements IServiceEntrySurveyRepository
{
  constructor(
    @InjectModel(ServiceEntrySurveyDocument.name)
    private readonly model: Model<ServiceEntrySurveyDocument>,
  ) {}

  async create(
    survey: ServiceEntrySurvey,
  ): Promise<{ data: ServiceEntrySurvey | null }> {
    const data = MongooseServiceEntrySurveyMapper.toMongoose(survey);
    const document = new this.model(data);
    await document.save();

    return {
      data: MongooseServiceEntrySurveyMapper.toDomain(document),
    };
  }

  async update(
    survey: ServiceEntrySurvey,
  ): Promise<{ data: ServiceEntrySurvey | null }> {
    const data = MongooseServiceEntrySurveyMapper.toMongoose(survey);

    const document = await this.model
      .findOneAndUpdate({ service_entry_survey_id: survey.id }, data, {
        new: true,
      })
      .exec();

    return {
      data: document
        ? MongooseServiceEntrySurveyMapper.toDomain(document)
        : null,
    };
  }

  async findByTokenHash(
    tokenHash: string,
  ): Promise<{ data: ServiceEntrySurvey | null }> {
    const document = await this.model.findOne({ token_hash: tokenHash }).exec();

    return {
      data: document
        ? MongooseServiceEntrySurveyMapper.toDomain(document)
        : null,
    };
  }

  async findByServiceEntryId(
    serviceEntryId: string,
  ): Promise<{ data: ServiceEntrySurvey | null }> {
    const document = await this.model
      .findOne({ service_entry_id: serviceEntryId })
      .exec();

    return {
      data: document
        ? MongooseServiceEntrySurveyMapper.toDomain(document)
        : null,
    };
  }

  async findAll(params: {
    from?: Date | null;
    to?: Date | null;
    serviceEntryIds?: string[];
  }): Promise<{ data: ServiceEntrySurvey[] }> {
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

    const documents = await this.model.find(filter).exec();

    return {
      data: documents
        .map((document) => MongooseServiceEntrySurveyMapper.toDomain(document))
        .filter((survey): survey is ServiceEntrySurvey => survey !== null),
    };
  }
}
