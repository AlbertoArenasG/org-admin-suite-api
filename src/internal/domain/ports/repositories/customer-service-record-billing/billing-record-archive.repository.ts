import { BillingRecordArchive } from '@domain/entities';

export interface IBillingRecordArchiveRepository {
  create(archive: BillingRecordArchive): Promise<void>;
  findById(
    recordId: string,
    archiveId: string,
  ): Promise<BillingRecordArchive | null>;
  findAll(
    recordId: string,
    page: number,
    perPage: number,
  ): Promise<{ data: BillingRecordArchive[]; total: number }>;
}

export const IBillingRecordArchiveRepositoryToken = Symbol(
  'IBillingRecordArchiveRepository',
);
