import { Injectable } from '@nestjs/common';

import { FileViewDto } from '@application/dto';

@Injectable()
export class FilePresenter {
  toResponse(file: FileViewDto) {
    return {
      id: file.id,
      original_name: file.originalName,
      filename: file.filename,
      mime_type: file.mimeType,
      size: file.size,
      storage_key: file.storageKey,
      bucket: file.bucket,
      url: file.url,
      uploaded_by: file.uploadedBy,
      metadata: file.metadata,
      created_at: file.createdAt,
    };
  }

  toCollection(files: FileViewDto[]) {
    return files.map((file) => this.toResponse(file));
  }
}
