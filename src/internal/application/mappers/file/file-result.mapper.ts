import { File } from '@domain/entities';
import { FileViewDto } from '@application/dto';

export class FileResultMapper {
  static toViewDto(file: File): FileViewDto {
    return {
      id: file.id,
      originalName: file.originalName,
      filename: file.filename,
      mimeType: file.mimeType,
      size: file.size,
      storageKey: file.storageKey,
      bucket: file.bucket,
      url: file.url ?? null,
      uploadedBy: file.uploadedBy ?? null,
      metadata: file.metadata ?? {},
      createdAt: file.createdAt ?? new Date(),
    };
  }

  static toCollection(files: File[]): FileViewDto[] {
    return files.map((file) => this.toViewDto(file));
  }
}
