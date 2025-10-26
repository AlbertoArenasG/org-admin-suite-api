import { File } from '@domain/entities';

export interface IFileWriteRepository {
  create(file: File): Promise<{ data: File | null }>;
}

export const IFileWriteRepositoryToken = Symbol('IFileWriteRepository');
