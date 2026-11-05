import { Inject, Injectable } from '@nestjs/common';
import {
  UpdateBillingCustomerServiceRecordPaymentComplementDto,
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
export class UpdateBillingCustomerServiceRecordPaymentComplementUseCase {
  constructor(
    @Inject(IBillingCustomerServiceRecordReadRepositoryToken)
    private readonly readRepository: IBillingCustomerServiceRecordReadRepository,
    @Inject(ICustomerServiceRecordWriteRepositoryToken)
    private readonly writeRepository: ICustomerServiceRecordWriteRepository,
    private readonly attachments: CustomerServiceRecordAttachmentReconciliationService,
  ) {}

  async execute(
    input: UpdateBillingCustomerServiceRecordPaymentComplementDto,
  ): Promise<BillingCustomerServiceRecordViewDto> {
    const { data: record } = await this.readRepository.findById(input.recordId);
    if (!record)
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.CUSTOMER_SERVICE_RECORD,
        { recordId: input.recordId },
      );
    const invoice = record.invoice;
    const index = invoice.paymentComplements.findIndex(
      (item) => item.id === input.complementId,
    );
    if (index < 0)
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.CUSTOMER_SERVICE_RECORD,
        { complementId: input.complementId },
      );
    const collection = await this.attachments.reconcile({
      collection: invoice.paymentComplements[index],
      fileIds: input.fileIds,
      actorUserId: input.actorUserId,
    });
    invoice.paymentComplements[index] = {
      id: input.complementId,
      referenceNumber: input.referenceNumber?.trim() || null,
      ...collection,
    };
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
