export interface DownloadServicePackageRecordFileDto {
  recordId: string;
  fileId: string;
}

export interface DownloadServicePackageRecordFileResultDto {
  stream: NodeJS.ReadableStream;
  filename: string;
  mimeType: string;
  size: number;
}
