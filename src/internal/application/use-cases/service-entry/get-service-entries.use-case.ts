import { Inject, Injectable } from '@nestjs/common';

import {
  GetServiceEntriesDto,
  GetServiceEntriesResultDto,
} from '@application/dto';
import {
  FindServiceEntriesParams,
  IServiceEntryRepository,
  IServiceEntryRepositoryToken,
} from '@domain/ports/repositories';
import { ServiceEntryMapper } from '@application/mappers';

@Injectable()
export class GetServiceEntriesUseCase {
  constructor(
    @Inject(IServiceEntryRepositoryToken)
    private readonly repository: IServiceEntryRepository,
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

    const { data, total } = await this.repository.findAll(params);

    return {
      items: ServiceEntryMapper.toCollection(data),
      total,
      page: input.page,
      perPage: input.perPage,
    };
  }
}
