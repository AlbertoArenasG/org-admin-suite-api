import { Inject, Injectable } from '@nestjs/common';
import {
  UpdateBillingCustomerServiceRecordPurchaseOrderDto,
  BillingCustomerServiceRecordViewDto,
} from '@application/dto/customer-service-record-billing';
import { BillingCustomerServiceRecordMapper } from '@application/mappers/customer-service-record-billing';
import { CustomerServiceRecordAttachmentReconciliationService } from '@application/services/customer-service-record';
import { CustomerServiceRecordBillingStatus } from '@domain/entities';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
  StateConflictException,
  StateConflictExceptionCode,
} from '@domain/exceptions';
import {
  IBillingCustomerServiceRecordReadRepository,
  IBillingCustomerServiceRecordReadRepositoryToken,
  ICustomerServiceRecordWriteRepository,
  ICustomerServiceRecordWriteRepositoryToken,
} from '@domain/ports/repositories';

@Injectable()
export class UpdateBillingCustomerServiceRecordPurchaseOrderUseCase {
  constructor(
    @Inject(IBillingCustomerServiceRecordReadRepositoryToken)
    private readonly readRepository: IBillingCustomerServiceRecordReadRepository,
    @Inject(ICustomerServiceRecordWriteRepositoryToken)
    private readonly writeRepository: ICustomerServiceRecordWriteRepository,
    private readonly attachments: CustomerServiceRecordAttachmentReconciliationService,
  ) {}

  async execute(
    input: UpdateBillingCustomerServiceRecordPurchaseOrderDto,
  ): Promise<BillingCustomerServiceRecordViewDto> {
    const { data: record } = await this.readRepository.findById(input.recordId);
    if (!record)
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.CUSTOMER_SERVICE_RECORD,
        { recordId: input.recordId },
      );
    const collection = await this.attachments.reconcile({
      collection: record.purchaseOrder,
      fileIds: input.fileIds,
      actorUserId: input.actorUserId,
    });
    record.updateDetails(
      {
        purchaseOrder: {
          ...collection,
          referenceNumber: input.referenceNumber?.trim() || null,
        },
      },
      input.actorUserId,
    );
    record.updateDetails(
      this.attachments.calculateCounts(record),
      input.actorUserId,
    );
    const { data } = await this.writeRepository.updateBillingPurchaseOrder(
      record,
      record.billingStatus as
        | CustomerServiceRecordBillingStatus.SUBMITTED
        | CustomerServiceRecordBillingStatus.INVOICED,
    );
    if (!data)
      throw StateConflictException.create(
        StateConflictExceptionCode.CUSTOMER_SERVICE_RECORD_INVOICE_CHANGED,
      );
    return BillingCustomerServiceRecordMapper.toViewDto(data);
  }
}
