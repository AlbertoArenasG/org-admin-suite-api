import { Inject, Injectable } from '@nestjs/common';

import { DownloadFileDto, DownloadFileResultDto } from '@application/dto';
import {
  IFileReadRepository,
  IFileReadRepositoryToken,
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
  ) {}

  async execute(input: DownloadFileDto): Promise<DownloadFileResultDto> {
    const { data } = await this.fileReadRepository.findById(input.fileId);

    if (!data) {
      throw EntityNotFoundException.create(EntityNotFoundExceptionCode.FILE, {
        fileId: input.fileId,
      });
    }

    const object = await this.fileStorageService.getObject(data.storageKey);

    return {
      stream: object.stream,
      filename: data.originalName,
      mimeType: object.contentType ?? data.mimeType,
      size: object.contentLength ?? data.size,
    };
  }
}
