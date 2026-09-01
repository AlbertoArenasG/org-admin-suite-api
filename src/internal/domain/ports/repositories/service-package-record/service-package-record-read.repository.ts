import { ServicePackageRecord } from '@domain/entities';

export interface FindServicePackageRecordsParams {
  page: number;
  perPage: number;
  packageId?: string | null;
  search?: string | null;
  serviceType?: string | null;
}

export interface FindServicePackageRecordsResult {
  data: ServicePackageRecord[];
  total: number;
}

export interface IServicePackageRecordReadRepository {
  findAll(
    params: FindServicePackageRecordsParams,
  ): Promise<FindServicePackageRecordsResult>;
  findById(recordId: string): Promise<{ data: ServicePackageRecord | null }>;
  findServiceTypes(): Promise<{ data: string[] }>;
}

export const IServicePackageRecordReadRepositoryToken = Symbol(
  'IServicePackageRecordReadRepository',
);
