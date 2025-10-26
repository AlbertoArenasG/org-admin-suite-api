import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ServiceEntrySurvey } from '@domain/entities';
import { ServiceEntrySurveyDocument } from '@infra/persistence/mongoose/schemas';
import { MongooseServiceEntrySurveyMapper } from '@infra/persistence/mongoose/mappers';

@Injectable()
export class MongooseServiceEntrySurveyBaseRepository {
  constructor(
    @InjectModel(ServiceEntrySurveyDocument.name)
    protected readonly surveyModel: Model<ServiceEntrySurveyDocument>,
  ) {}

  protected toDomain(
    document: ServiceEntrySurveyDocument,
  ): ServiceEntrySurvey | null {
    return MongooseServiceEntrySurveyMapper.toDomain(document);
  }

  protected toMongoose(survey: ServiceEntrySurvey) {
    return MongooseServiceEntrySurveyMapper.toMongoose(survey);
  }
}
