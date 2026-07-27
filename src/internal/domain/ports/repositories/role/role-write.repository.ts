import { Role } from '@domain/entities';

export interface IRoleWriteRepository {
  create(role: Role): Promise<{ data: Role | null }>;
  update(role: Role): Promise<{ data: Role | null }>;
}

export const IRoleWriteRepositoryToken = Symbol('IRoleWriteRepository');
