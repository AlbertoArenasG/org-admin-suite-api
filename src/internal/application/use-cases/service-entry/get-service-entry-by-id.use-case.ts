import { Inject, Injectable } from '@nestjs/common';

import { ServiceEntryMapper } from '@application/mappers';
import { ServiceEntryStatus } from '@domain/entities';
import { ServiceEntryViewDto } from '@application/dto';
import {
  IServiceEntryReadRepository,
  IServiceEntryReadRepositoryToken,
  IFileReadRepository,
  IFileReadRepositoryToken,
} from '@domain/ports/repositories';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
} from '@domain/exceptions';
import { buildFilesMetadataForEntry } from '@application/utils';

@Injectable()
export class GetServiceEntryByIdUseCase {
  constructor(
    @Inject(IServiceEntryReadRepositoryToken)
    private readonly serviceEntryReadRepository: IServiceEntryReadRepository,
    @Inject(IFileReadRepositoryToken)
    private readonly fileReadRepository: IFileReadRepository,
  ) {}

  async execute(id: string): Promise<ServiceEntryViewDto> {
    const { data } = await this.serviceEntryReadRepository.findById(id);

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

    const filesMetadata = await buildFilesMetadataForEntry({
      entry: data,
      fileReadRepository: this.fileReadRepository,
    });

    return ServiceEntryMapper.toViewDto(data, filesMetadata);
  }
}
