import { FileViewDto } from './file-view.dto';

export interface GetFileByIdDto {
  fileId: string;
}

export type GetFileByIdResultDto = FileViewDto;

export interface DownloadFileDto {
  fileId: string;
}

export interface DownloadFileResultDto {
  stream: NodeJS.ReadableStream;
  filename: string;
  mimeType: string;
  size: number;
}
