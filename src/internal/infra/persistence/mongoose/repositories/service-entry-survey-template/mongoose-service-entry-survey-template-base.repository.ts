import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ServiceEntrySurveyTemplate } from '@domain/entities';
import { ServiceEntrySurveyTemplateDocument } from '@infra/persistence/mongoose/schemas';
import { MongooseServiceEntrySurveyTemplateMapper } from '@infra/persistence/mongoose/mappers';

@Injectable()
export class MongooseServiceEntrySurveyTemplateBaseRepository {
  constructor(
    @InjectModel(ServiceEntrySurveyTemplateDocument.name)
    protected readonly templateModel: Model<ServiceEntrySurveyTemplateDocument>,
  ) {}

  protected toDomain(
    document: ServiceEntrySurveyTemplateDocument,
  ): ServiceEntrySurveyTemplate | null {
    return MongooseServiceEntrySurveyTemplateMapper.toDomain(document);
  }
}
