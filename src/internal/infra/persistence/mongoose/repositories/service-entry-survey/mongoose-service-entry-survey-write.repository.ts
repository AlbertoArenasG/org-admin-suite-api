import { Injectable } from '@nestjs/common';

import { ServiceEntrySurvey } from '@domain/entities';
import { IServiceEntrySurveyWriteRepository } from '@domain/ports/repositories';
import { MongooseServiceEntrySurveyBaseRepository } from './mongoose-service-entry-survey-base.repository';

@Injectable()
export class MongooseServiceEntrySurveyWriteRepositoryImpl
  extends MongooseServiceEntrySurveyBaseRepository
  implements IServiceEntrySurveyWriteRepository
{
  async create(
    survey: ServiceEntrySurvey,
  ): Promise<{ data: ServiceEntrySurvey | null }> {
    const data = this.toMongoose(survey);
    const document = new this.surveyModel(data);
    await document.save();

    return {
      data: this.toDomain(document),
    };
  }
}
