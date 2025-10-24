import { File } from '@domain/entities';

export interface FileCreateResult {
  data: File | null;
}

export interface FileFindResult {
  data: File | null;
}

export interface IFileRepository {
  create(file: File): Promise<FileCreateResult>;
  findById(fileId: string): Promise<FileFindResult>;
}

export const IFileRepositoryToken = Symbol('IFileRepository');
