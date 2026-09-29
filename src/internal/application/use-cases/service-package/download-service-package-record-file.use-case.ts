import { Inject, Injectable } from '@nestjs/common';

import {
  DownloadServicePackageRecordFileDto,
  DownloadServicePackageRecordFileResultDto,
} from '@application/dto';
import {
  IServicePackageRecordReadRepository,
  IServicePackageRecordReadRepositoryToken,
} from '@domain/ports/repositories';
import {
  IFileStorageService,
  IFileStorageServiceToken,
} from '@domain/ports/services';
import { ServicePackageRecordStatus } from '@domain/entities';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
} from '@domain/exceptions';

@Injectable()
export class DownloadServicePackageRecordFileUseCase {
  constructor(
    @Inject(IServicePackageRecordReadRepositoryToken)
    private readonly recordReadRepository: IServicePackageRecordReadRepository,
    @Inject(IFileStorageServiceToken)
    private readonly fileStorageService: IFileStorageService,
  ) {}

  async execute(
    input: DownloadServicePackageRecordFileDto,
  ): Promise<DownloadServicePackageRecordFileResultDto> {
    const { data: record } = await this.recordReadRepository.findById(
      input.recordId,
    );

    if (!record || record.status === ServicePackageRecordStatus.DELETED) {
      throw this.createNotFoundException(input.recordId);
    }

    const file = record.files.find(
      (candidate) => (candidate.id ?? candidate.s3Key) === input.fileId,
    );

    if (!file) {
      throw this.createNotFoundException(input.recordId);
    }

    const object = await this.fileStorageService.getObject(file.s3Key);

    return {
      stream: object.stream,
      filename: file.originalName,
      mimeType: object.contentType ?? file.contentType,
      size: object.contentLength ?? file.size,
    };
  }

  private createNotFoundException(recordId: string): EntityNotFoundException {
    return EntityNotFoundException.create(
      EntityNotFoundExceptionCode.SERVICE_PACKAGE_RECORD,
      { recordId },
    );
  }
}
