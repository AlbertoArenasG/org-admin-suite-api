import { Injectable } from '@nestjs/common';

import { IServiceEntrySurveyTemplateReadRepository } from '@domain/ports/repositories';
import { ServiceEntrySurveyTemplate } from '@domain/entities';
import { MongooseServiceEntrySurveyTemplateBaseRepository } from './mongoose-service-entry-survey-template-base.repository';

@Injectable()
export class MongooseServiceEntrySurveyTemplateReadRepositoryImpl
  extends MongooseServiceEntrySurveyTemplateBaseRepository
  implements IServiceEntrySurveyTemplateReadRepository
{
  async findActiveByCategory(
    category: string | null,
  ): Promise<{ data: ServiceEntrySurveyTemplate | null }> {
    const filters = [
      { category: category ?? null, is_default: true },
      { category: category ?? null },
      { category: null, is_default: true },
    ];

    for (const filter of filters) {
      const document = await this.templateModel
        .findOne(filter)
        .sort({ version: -1 })
        .exec();

      if (document) {
        return { data: this.toDomain(document) };
      }
    }

    return { data: null };
  }

  async findByIdAndVersion(
    templateId: string,
    version: number,
  ): Promise<{ data: ServiceEntrySurveyTemplate | null }> {
    const document = await this.templateModel
      .findOne({ template_id: templateId, version })
      .exec();

    return {
      data: document ? this.toDomain(document) : null,
    };
  }
}
