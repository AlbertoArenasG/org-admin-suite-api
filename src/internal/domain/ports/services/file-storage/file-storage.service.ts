export interface UploadFileParams {
  key: string;
  body: Buffer;
  contentType: string;
}

export interface UploadFileResult {
  key: string;
  bucket: string;
  url?: string;
}

export interface GetObjectResult {
  stream: NodeJS.ReadableStream;
  contentLength?: number;
  contentType?: string;
}

export interface IFileStorageService {
  upload(params: UploadFileParams): Promise<UploadFileResult>;
  getObject(key: string): Promise<GetObjectResult>;
}

export const IFileStorageServiceToken = Symbol('IFileStorageService');
