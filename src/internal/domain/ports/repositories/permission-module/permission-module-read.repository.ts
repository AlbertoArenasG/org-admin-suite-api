import { CatalogStatus } from '@domain/entities';

export interface PermissionModuleRecord {
  id: string;
  code: string;
  name: string;
  status: CatalogStatus;
  isSystem: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPermissionModuleReadRepository {
  findByCode(code: string): Promise<{ data: PermissionModuleRecord | null }>;
  findAllActive(): Promise<{ data: PermissionModuleRecord[] }>;
}

export const IPermissionModuleReadRepositoryToken = Symbol(
  'IPermissionModuleReadRepository',
);
