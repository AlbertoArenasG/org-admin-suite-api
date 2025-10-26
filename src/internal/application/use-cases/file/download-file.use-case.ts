import { Inject, Injectable } from '@nestjs/common';

import { DownloadFileDto, DownloadFileResultDto } from '@application/dto';
import {
  IFileReadRepository,
  IFileReadRepositoryToken,
  IServiceEntryAccessReadRepository,
  IServiceEntryAccessReadRepositoryToken,
  IServiceEntryAccessWriteRepository,
  IServiceEntryAccessWriteRepositoryToken,
} from '@domain/ports/repositories';
import {
  IFileStorageService,
  IFileStorageServiceToken,
} from '@domain/ports/services';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
} from '@domain/exceptions';

@Injectable()
export class DownloadFileUseCase {
  constructor(
    @Inject(IFileReadRepositoryToken)
    private readonly fileReadRepository: IFileReadRepository,
    @Inject(IFileStorageServiceToken)
    private readonly fileStorageService: IFileStorageService,
    @Inject(IServiceEntryAccessReadRepositoryToken)
    private readonly accessReadRepository: IServiceEntryAccessReadRepository,
    @Inject(IServiceEntryAccessWriteRepositoryToken)
    private readonly accessWriteRepository: IServiceEntryAccessWriteRepository,
  ) {}

  async execute(input: DownloadFileDto): Promise<DownloadFileResultDto> {
    const { data } = await this.fileReadRepository.findById(input.fileId);

    if (!data) {
      throw EntityNotFoundException.create(EntityNotFoundExceptionCode.FILE, {
        fileId: input.fileId,
      });
    }

    const object = await this.fileStorageService.getObject(data.storageKey);

    if (input.serviceEntryId) {
      await this.markServiceEntryDownload(input.serviceEntryId);
    }

    return {
      stream: object.stream,
      filename: data.originalName,
      mimeType: object.contentType ?? data.mimeType,
      size: object.contentLength ?? data.size,
    };
  }

  private async markServiceEntryDownload(
    serviceEntryId: string,
  ): Promise<void> {
    const { data: access } =
      await this.accessReadRepository.findByServiceEntryId(serviceEntryId);

    if (!access) {
      return;
    }

    access.markDownloaded();
    await this.accessWriteRepository.update(access);
  }
}
