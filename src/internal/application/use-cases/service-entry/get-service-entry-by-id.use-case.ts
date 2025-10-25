import { Inject, Injectable } from '@nestjs/common';

import { ServiceEntryMapper } from '@application/mappers';
import { ServiceEntryStatus } from '@domain/entities';
import { ServiceEntryViewDto } from '@application/dto';
import {
  IServiceEntryRepository,
  IServiceEntryRepositoryToken,
} from '@domain/ports/repositories';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
} from '@domain/exceptions';

@Injectable()
export class GetServiceEntryByIdUseCase {
  constructor(
    @Inject(IServiceEntryRepositoryToken)
    private readonly repository: IServiceEntryRepository,
  ) {}

  async execute(id: string): Promise<ServiceEntryViewDto> {
    const { data } = await this.repository.findById(id);

    if (!data) {
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.SERVICE_ENTRY,
        { id },
      );
    }

    if (data.status === ServiceEntryStatus.DELETED) {
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.SERVICE_ENTRY,
        { id },
      );
    }

    return ServiceEntryMapper.toViewDto(data);
  }
}
