import { Inject, Injectable } from '@nestjs/common';

import { ServiceEntryMapper } from '@application/mappers';
import { ServiceEntryViewDto } from '@application/dto';
import {
  IServiceEntryReadRepository,
  IServiceEntryReadRepositoryToken,
  IServiceEntryAccessReadRepository,
  IServiceEntryAccessReadRepositoryToken,
  IServiceEntryAccessWriteRepository,
  IServiceEntryAccessWriteRepositoryToken,
  IFileReadRepository,
  IFileReadRepositoryToken,
  IServiceEntrySurveyReadRepository,
  IServiceEntrySurveyReadRepositoryToken,
} from '@domain/ports/repositories';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
} from '@domain/exceptions';
import { ServiceEntryStatus } from '@domain/entities';
import { createHash } from 'crypto';
import {
  buildFilesMetadataForEntry,
  buildInteractionStatusForEntry,
} from '@application/utils';

@Injectable()
export class GetServiceEntryByTokenUseCase {
  constructor(
    @Inject(IServiceEntryReadRepositoryToken)
    private readonly serviceEntryReadRepository: IServiceEntryReadRepository,
    @Inject(IServiceEntryAccessReadRepositoryToken)
    private readonly accessReadRepository: IServiceEntryAccessReadRepository,
    @Inject(IServiceEntryAccessWriteRepositoryToken)
    private readonly accessWriteRepository: IServiceEntryAccessWriteRepository,
    @Inject(IFileReadRepositoryToken)
    private readonly fileReadRepository: IFileReadRepository,
    @Inject(IServiceEntrySurveyReadRepositoryToken)
    private readonly surveyReadRepository: IServiceEntrySurveyReadRepository,
  ) {}

  async execute(token: string): Promise<ServiceEntryViewDto> {
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const { data: access } =
      await this.accessReadRepository.findByTokenHash(tokenHash);

    if (!access) {
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.SERVICE_ENTRY,
        { token },
      );
    }

    const { data: entry } = await this.serviceEntryReadRepository.findById(
      access.serviceEntryId,
    );

    if (!entry || entry.status === ServiceEntryStatus.DELETED) {
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.SERVICE_ENTRY,
        { token },
      );
    }

    access.markViewed();
    await this.accessWriteRepository.update(access);

    const [filesMetadata, interactionStatus] = await Promise.all([
      buildFilesMetadataForEntry({
        entry,
        fileReadRepository: this.fileReadRepository,
      }),
      buildInteractionStatusForEntry({
        entry,
        accessReadRepository: this.accessReadRepository,
        surveyReadRepository: this.surveyReadRepository,
      }),
    ]);

    return ServiceEntryMapper.toViewDto(
      entry,
      filesMetadata,
      interactionStatus,
    );
  }
}
