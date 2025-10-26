import { File } from '@domain/entities';

export interface IFileReadRepository {
  findById(fileId: string): Promise<{ data: File | null }>;
  findManyByIds(fileIds: string[]): Promise<{ data: File[] }>;
}

export const IFileReadRepositoryToken = Symbol('IFileReadRepository');
