import { Inject, Injectable } from '@nestjs/common';

import {
  UpdateBillingCustomerServiceRecordInvoiceDto,
  UpdateBillingCustomerServiceRecordInvoiceResultDto,
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
export class UpdateBillingCustomerServiceRecordInvoiceUseCase {
  constructor(
    @Inject(IBillingCustomerServiceRecordReadRepositoryToken)
    private readonly readRepository: IBillingCustomerServiceRecordReadRepository,
    @Inject(ICustomerServiceRecordWriteRepositoryToken)
    private readonly writeRepository: ICustomerServiceRecordWriteRepository,
    private readonly attachmentReconciliation: CustomerServiceRecordAttachmentReconciliationService,
  ) {}

  async execute(
    input: UpdateBillingCustomerServiceRecordInvoiceDto,
  ): Promise<UpdateBillingCustomerServiceRecordInvoiceResultDto> {
    const { data: record } = await this.readRepository.findById(input.recordId);
    if (!record) {
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.CUSTOMER_SERVICE_RECORD,
        { recordId: input.recordId },
      );
    }

    const previousStatus = record.billingStatus;
    if (
      previousStatus !== CustomerServiceRecordBillingStatus.SUBMITTED &&
      previousStatus !== CustomerServiceRecordBillingStatus.INVOICED
    ) {
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.CUSTOMER_SERVICE_RECORD,
        { recordId: input.recordId },
      );
    }
    const invoice = await this.attachmentReconciliation.reconcile({
      collection: record.invoice,
      fileIds: input.fileIds,
      actorUserId: input.actorUserId,
    });
    record.updateDetails(
      {
        invoice: {
          ...invoice,
          referenceNumber: input.referenceNumber?.trim() || null,
        },
      },
      input.actorUserId,
    );
    record.updateDetails(
      this.attachmentReconciliation.calculateCounts(record),
      input.actorUserId,
    );

    const { data } = await this.writeRepository.updateBillingInvoice(
      record,
      previousStatus,
    );
    if (!data) {
      throw StateConflictException.create(
        StateConflictExceptionCode.CUSTOMER_SERVICE_RECORD_BILLING_STATUS_CHANGED,
      );
    }
    return BillingCustomerServiceRecordMapper.toViewDto(data);
  }
}
