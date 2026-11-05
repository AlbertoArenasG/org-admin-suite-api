import { Inject, Injectable } from '@nestjs/common';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
} from '@domain/exceptions';
import {
  IBillingCustomerServiceRecordReadRepository,
  IBillingCustomerServiceRecordReadRepositoryToken,
  IBillingRecordCommentRepository,
  IBillingRecordCommentRepositoryToken,
} from '@domain/ports/repositories';

@Injectable()
export class GetBillingCustomerServiceRecordCommentsUseCase {
  constructor(
    @Inject(IBillingCustomerServiceRecordReadRepositoryToken)
    private readonly records: IBillingCustomerServiceRecordReadRepository,
    @Inject(IBillingRecordCommentRepositoryToken)
    private readonly comments: IBillingRecordCommentRepository,
  ) {}
  async execute(recordId: string, page: number, perPage: number) {
    const { data } = await this.records.findById(recordId);
    if (!data)
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.CUSTOMER_SERVICE_RECORD,
        { recordId },
      );
    return this.comments.findAll(recordId, page, perPage);
  }
}
