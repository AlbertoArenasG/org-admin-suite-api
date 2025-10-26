import { Inject, Injectable } from '@nestjs/common';
import { extname } from 'path';

import { UploadFilesDto, UploadFilesResultDto } from '@application/dto';
import { File } from '@domain/entities';
import {
  IFileWriteRepository,
  IFileWriteRepositoryToken,
} from '@domain/ports/repositories';
import {
  IFileStorageService,
  IFileStorageServiceToken,
} from '@domain/ports/services';
import { FileResultMapper } from '@application/mappers';
import { genId } from '@src/common/utils';

@Injectable()
export class UploadFilesUseCase {
  constructor(
    @Inject(IFileWriteRepositoryToken)
    private readonly fileWriteRepository: IFileWriteRepository,
    @Inject(IFileStorageServiceToken)
    private readonly fileStorage: IFileStorageService,
  ) {}

  async execute(input: UploadFilesDto): Promise<UploadFilesResultDto> {
    const uploadedFiles: File[] = [];

    for (const file of input.files) {
      const fileId = genId();
      const extension = this.normalizeExtension(file.originalName);
      const filename = `${fileId}${extension}`;
      const storageKey = `uploads/${fileId}/${filename}`;

      const uploadResult = await this.fileStorage.upload({
        key: storageKey,
        body: file.buffer,
        contentType: file.mimeType,
      });

      const fileEntity = new File({
        id: fileId,
        originalName: file.originalName,
        filename,
        mimeType: file.mimeType,
        size: file.size,
        storageKey: uploadResult.key,
        bucket: uploadResult.bucket,
        url: uploadResult.url ?? null,
        uploadedBy: input.uploadedBy,
        metadata: file.metadata ?? {},
        createdAt: new Date(),
      });

      const { data } = await this.fileWriteRepository.create(fileEntity);
      if (data) {
        uploadedFiles.push(data);
      }
    }

    return {
      files: FileResultMapper.toCollection(uploadedFiles),
    };
  }

  private normalizeExtension(originalName: string): string {
    const extension = extname(originalName);
    if (!extension) {
      return '';
    }
    return extension.toLowerCase();
  }
}
