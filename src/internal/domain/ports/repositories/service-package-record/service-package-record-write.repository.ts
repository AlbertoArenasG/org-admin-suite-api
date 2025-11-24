import { ServicePackageRecord } from '@domain/entities';

export interface IServicePackageRecordWriteRepository {
  create(
    record: ServicePackageRecord,
  ): Promise<{ data: ServicePackageRecord | null }>;
}

export const IServicePackageRecordWriteRepositoryToken = Symbol(
  'IServicePackageRecordWriteRepository',
);
