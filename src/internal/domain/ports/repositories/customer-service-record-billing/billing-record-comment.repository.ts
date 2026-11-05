import { BillingRecordComment } from '@domain/entities';

export interface IBillingRecordCommentRepository {
  create(comment: BillingRecordComment): Promise<BillingRecordComment>;
  findAll(
    recordId: string,
    page: number,
    perPage: number,
  ): Promise<{ data: BillingRecordComment[]; total: number }>;
}

export const IBillingRecordCommentRepositoryToken = Symbol(
  'IBillingRecordCommentRepository',
);
