import { Inject, Injectable } from '@nestjs/common';
import { genId } from '@src/common/utils';
import {
  CreateBillingCustomerServiceRecordPaymentComplementDto,
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
export class CreateBillingCustomerServiceRecordPaymentComplementUseCase {
  constructor(
    @Inject(IBillingCustomerServiceRecordReadRepositoryToken)
    private readonly readRepository: IBillingCustomerServiceRecordReadRepository,
    @Inject(ICustomerServiceRecordWriteRepositoryToken)
    private readonly writeRepository: ICustomerServiceRecordWriteRepository,
    private readonly attachments: CustomerServiceRecordAttachmentReconciliationService,
  ) {}

  async execute(
    input: CreateBillingCustomerServiceRecordPaymentComplementDto,
  ): Promise<BillingCustomerServiceRecordViewDto> {
    const { data: record } = await this.readRepository.findById(input.recordId);
    if (!record)
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.CUSTOMER_SERVICE_RECORD,
        { recordId: input.recordId },
      );
    const collection = await this.attachments.reconcile({
      collection: { files: [], removedFiles: [] },
      fileIds: input.fileIds,
      actorUserId: input.actorUserId,
    });
    const invoice = record.invoice;
    invoice.paymentComplements.push({
      id: genId(),
      referenceNumber: input.referenceNumber?.trim() || null,
      ...collection,
    });
    record.updateDetails({ invoice }, input.actorUserId);
    record.updateDetails(
      this.attachments.calculateCounts(record),
      input.actorUserId,
    );
    const { data } = await this.writeRepository.updateBillingInvoice(
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
