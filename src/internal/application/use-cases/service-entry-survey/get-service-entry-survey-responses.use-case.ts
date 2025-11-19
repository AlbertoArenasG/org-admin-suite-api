import { Inject, Injectable } from '@nestjs/common';

import {
  GetServiceEntrySurveyResponsesDto,
  GetServiceEntrySurveyResponsesResultDto,
  ServiceEntrySurveyListItemDto,
  ServiceEntrySurveyViewDto,
} from '@application/dto';
import {
  IServiceEntrySurveyReadRepository,
  IServiceEntrySurveyReadRepositoryToken,
  IServiceEntryReadRepository,
  IServiceEntryReadRepositoryToken,
  IFileReadRepository,
  IFileReadRepositoryToken,
  IServiceEntryAccessReadRepository,
  IServiceEntryAccessReadRepositoryToken,
} from '@domain/ports/repositories';
import { ServiceEntryMapper } from '@application/mappers';
import {
  buildFilesMetadataForEntries,
  buildInteractionStatusForEntries,
} from '@application/utils';

@Injectable()
export class GetServiceEntrySurveyResponsesUseCase {
  constructor(
    @Inject(IServiceEntrySurveyReadRepositoryToken)
    private readonly surveyReadRepository: IServiceEntrySurveyReadRepository,
    @Inject(IServiceEntryReadRepositoryToken)
    private readonly serviceEntryReadRepository: IServiceEntryReadRepository,
    @Inject(IFileReadRepositoryToken)
    private readonly fileReadRepository: IFileReadRepository,
    @Inject(IServiceEntryAccessReadRepositoryToken)
    private readonly accessReadRepository: IServiceEntryAccessReadRepository,
  ) {}

  async execute(
    input: GetServiceEntrySurveyResponsesDto,
  ): Promise<GetServiceEntrySurveyResponsesResultDto> {
    const filteredServiceEntryIds = await this.resolveServiceEntryIds(input);

    if (filteredServiceEntryIds && filteredServiceEntryIds.length === 0) {
      return {
        items: [],
        page: input.page,
        perPage: input.perPage,
        total: 0,
      };
    }

    const { data: surveys, total } = await this.surveyReadRepository.findAll({
      from: input.from ?? null,
      to: input.to ?? null,
      serviceEntryIds: filteredServiceEntryIds,
      templateId: input.templateId ?? null,
      templateVersion: input.templateVersion ?? null,
      page: input.page,
      perPage: input.perPage,
    });

    if (surveys.length === 0) {
      return {
        items: [],
        page: input.page,
        perPage: input.perPage,
        total,
      };
    }

    const serviceEntryIds = Array.from(
      new Set(surveys.map((survey) => survey.serviceEntryId)),
    );

    const { data: serviceEntries } =
      await this.serviceEntryReadRepository.findByIds(serviceEntryIds);

    const serviceEntryMap = new Map(
      serviceEntries.map((entry) => [entry.id, entry]),
    );

    const metadataMap = await buildFilesMetadataForEntries({
      entries: serviceEntries,
      fileReadRepository: this.fileReadRepository,
    });

    const interactionMap = await buildInteractionStatusForEntries({
      entries: serviceEntries,
      accessReadRepository: this.accessReadRepository,
      surveyReadRepository: this.surveyReadRepository,
    });

    const items: ServiceEntrySurveyListItemDto[] = surveys
      .map((survey) => {
        const entry = serviceEntryMap.get(survey.serviceEntryId);
        if (!entry) {
          return null;
        }

        const serviceEntryView = ServiceEntryMapper.toViewDto(
          entry,
          metadataMap.get(entry.id),
          interactionMap.get(entry.id),
        );

        const surveyView: ServiceEntrySurveyViewDto = {
          id: survey.id,
          serviceEntryId: survey.serviceEntryId,
          accessId: survey.accessId,
          templateId: survey.templateId,
          templateVersion: survey.templateVersion,
          answers: survey.answers,
          observations: survey.observations,
          submittedAt: survey.submittedAt,
        };

        return {
          survey: surveyView,
          serviceEntry: serviceEntryView,
        };
      })
      .filter((item): item is ServiceEntrySurveyListItemDto => item !== null);

    return {
      items,
      page: input.page,
      perPage: input.perPage,
      total,
    };
  }

  private async resolveServiceEntryIds(
    input: GetServiceEntrySurveyResponsesDto,
  ): Promise<string[] | undefined> {
    let ids = input.serviceEntryIds ? [...input.serviceEntryIds] : undefined;

    if (input.search && input.search.trim().length > 0) {
      const matchedIds = await this.serviceEntryReadRepository.searchIds(
        input.search.trim(),
      );

      if (matchedIds.length === 0) {
        return [];
      }

      if (ids && ids.length > 0) {
        const matchedSet = new Set(matchedIds);
        ids = ids.filter((id) => matchedSet.has(id));
      } else {
        ids = matchedIds;
      }
    }

    return ids;
  }
}
