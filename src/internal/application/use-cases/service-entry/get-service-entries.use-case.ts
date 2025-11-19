import { Inject, Injectable } from '@nestjs/common';

import {
  GetServiceEntriesDto,
  GetServiceEntriesResultDto,
} from '@application/dto';
import {
  FindServiceEntriesParams,
  IServiceEntryReadRepository,
  IServiceEntryReadRepositoryToken,
  IFileReadRepository,
  IFileReadRepositoryToken,
  IServiceEntryAccessReadRepository,
  IServiceEntryAccessReadRepositoryToken,
  IServiceEntrySurveyReadRepository,
  IServiceEntrySurveyReadRepositoryToken,
} from '@domain/ports/repositories';
import { ServiceEntryMapper } from '@application/mappers';
import {
  buildFilesMetadataForEntries,
  buildInteractionStatusForEntries,
} from '@application/utils';

@Injectable()
export class GetServiceEntriesUseCase {
  constructor(
    @Inject(IServiceEntryReadRepositoryToken)
    private readonly serviceEntryReadRepository: IServiceEntryReadRepository,
    @Inject(IFileReadRepositoryToken)
    private readonly fileReadRepository: IFileReadRepository,
    @Inject(IServiceEntryAccessReadRepositoryToken)
    private readonly accessReadRepository: IServiceEntryAccessReadRepository,
    @Inject(IServiceEntrySurveyReadRepositoryToken)
    private readonly surveyReadRepository: IServiceEntrySurveyReadRepository,
  ) {}

  async execute(
    input: GetServiceEntriesDto,
  ): Promise<GetServiceEntriesResultDto> {
    const params: FindServiceEntriesParams = {
      page: input.page,
      perPage: input.perPage,
      search: input.search ?? null,
      sorts: input.sorts,
    };

    const { data, total } =
      await this.serviceEntryReadRepository.findAll(params);

    const metadataMap = await buildFilesMetadataForEntries({
      entries: data,
      fileReadRepository: this.fileReadRepository,
    });
    const statusMap = await buildInteractionStatusForEntries({
      entries: data,
      accessReadRepository: this.accessReadRepository,
      surveyReadRepository: this.surveyReadRepository,
    });

    return {
      items: ServiceEntryMapper.toCollection(data, metadataMap, statusMap),
      total,
      page: input.page,
      perPage: input.perPage,
    };
  }
}
