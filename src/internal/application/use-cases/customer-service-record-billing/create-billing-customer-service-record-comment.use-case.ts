import { Inject, Injectable } from '@nestjs/common';
import {
  BillingRecordComment,
  BillingRecordCommentVisibility,
} from '@domain/entities';
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
import { genId } from '@src/common/utils';

@Injectable()
export class CreateBillingCustomerServiceRecordCommentUseCase {
  constructor(
    @Inject(IBillingCustomerServiceRecordReadRepositoryToken)
    private readonly records: IBillingCustomerServiceRecordReadRepository,
    @Inject(IBillingRecordCommentRepositoryToken)
    private readonly comments: IBillingRecordCommentRepository,
  ) {}
  async execute(input: {
    recordId: string;
    text: string;
    visibility: BillingRecordCommentVisibility;
    actorUserId: string;
  }): Promise<BillingRecordComment> {
    const { data } = await this.records.findById(input.recordId);
    if (!data)
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.CUSTOMER_SERVICE_RECORD,
        { recordId: input.recordId },
      );
    const now = new Date();
    return this.comments.create({
      id: genId(),
      recordId: input.recordId,
      text: input.text.trim(),
      visibility: input.visibility,
      createdAt: now,
      updatedAt: now,
      createdBy: input.actorUserId,
      updatedBy: input.actorUserId,
    });
  }
}
