import { File } from '@domain/entities';
import { FileDocument } from '@infra/persistence/mongoose/schemas';

export class MongooseFileMapper {
  static toDomain(document: FileDocument): File | null {
    if (!document) {
      return null;
    }

    return new File({
      id: document.file_id,
      originalName: document.original_name,
      filename: document.filename,
      mimeType: document.mime_type,
      size: document.size,
      storageKey: document.storage_key,
      bucket: document.bucket,
      url: document.url ?? null,
      uploadedBy: document.uploaded_by ?? null,
      metadata: document.metadata ?? {},
      createdAt: document.createdAt ?? undefined,
      updatedAt: document.updatedAt ?? undefined,
    });
  }

  static toMongoose(file: File) {
    return {
      file_id: file.id,
      original_name: file.originalName,
      filename: file.filename,
      mime_type: file.mimeType,
      size: file.size,
      storage_key: file.storageKey,
      bucket: file.bucket,
      url: file.url ?? null,
      uploaded_by: file.uploadedBy ?? null,
      metadata: file.metadata ?? {},
    };
  }
}
