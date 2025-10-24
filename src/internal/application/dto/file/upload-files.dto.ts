import { FileViewDto } from './file-view.dto';

export interface UploadFileItemDto {
  originalName: string;
  mimeType: string;
  size: number;
  buffer: Buffer;
  metadata?: Record<string, unknown>;
}

export interface UploadFilesDto {
  files: UploadFileItemDto[];
  uploadedBy: string | null;
}

export interface UploadFilesResultDto {
  files: FileViewDto[];
}
