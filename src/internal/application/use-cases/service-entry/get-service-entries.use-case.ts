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
} from '@domain/ports/repositories';
import { ServiceEntryMapper } from '@application/mappers';
import { buildFilesMetadataForEntries } from '@application/utils';

@Injectable()
export class GetServiceEntriesUseCase {
  constructor(
    @Inject(IServiceEntryReadRepositoryToken)
    private readonly serviceEntryReadRepository: IServiceEntryReadRepository,
    @Inject(IFileReadRepositoryToken)
    private readonly fileReadRepository: IFileReadRepository,
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

    return {
      items: ServiceEntryMapper.toCollection(data, metadataMap),
      total,
      page: input.page,
      perPage: input.perPage,
    };
  }
}
