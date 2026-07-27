import { CatalogStatus } from '@domain/entities';

export interface PermissionOperationRecord {
  id: string;
  code: string;
  name: string;
  status: CatalogStatus;
  isSystem: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPermissionOperationReadRepository {
  findByCode(code: string): Promise<{ data: PermissionOperationRecord | null }>;
  findAllActive(): Promise<{ data: PermissionOperationRecord[] }>;
}

export const IPermissionOperationReadRepositoryToken = Symbol(
  'IPermissionOperationReadRepository',
);
