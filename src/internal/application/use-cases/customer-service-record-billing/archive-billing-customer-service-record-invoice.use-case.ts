import { Inject, Injectable } from '@nestjs/common';
import { BillingCustomerServiceRecordMapper } from '@application/mappers/customer-service-record-billing';
import {
  CustomerServiceRecordBillingStatus,
  CustomerServiceRecordInvoiceStatus,
} from '@domain/entities';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
  StateConflictException,
  StateConflictExceptionCode,
} from '@domain/exceptions';
import {
  IBillingCustomerServiceRecordReadRepository,
  IBillingCustomerServiceRecordReadRepositoryToken,
  IBillingRecordArchiveRepository,
  IBillingRecordArchiveRepositoryToken,
  ICustomerServiceRecordWriteRepository,
  ICustomerServiceRecordWriteRepositoryToken,
} from '@domain/ports/repositories';
import {
  ITransactionalExecutor,
  ITransactionalExecutorToken,
} from '@domain/ports/services';
import { genId } from '@src/common/utils';

@Injectable()
export class ArchiveBillingCustomerServiceRecordInvoiceUseCase {
  constructor(
    @Inject(IBillingCustomerServiceRecordReadRepositoryToken)
    private readonly readRepository: IBillingCustomerServiceRecordReadRepository,
    @Inject(ICustomerServiceRecordWriteRepositoryToken)
    private readonly writeRepository: ICustomerServiceRecordWriteRepository,
    @Inject(IBillingRecordArchiveRepositoryToken)
    private readonly archives: IBillingRecordArchiveRepository,
    @Inject(ITransactionalExecutorToken)
    private readonly transaction: ITransactionalExecutor,
  ) {}

  async execute(recordId: string, actorUserId: string) {
    return this.transaction.execute(async () => {
      const { data: record } = await this.readRepository.findById(recordId);
      if (!record)
        throw EntityNotFoundException.create(
          EntityNotFoundExceptionCode.CUSTOMER_SERVICE_RECORD,
          { recordId },
        );
      const invoice = record.invoice;
      const billing = record.billing;
      const hasData = Boolean(
        invoice.referenceNumber ||
          invoice.files.length ||
          invoice.removedFiles.length ||
          invoice.paymentComplements.length ||
          billing.issuedAt ||
          billing.deliveredAt ||
          billing.paymentTerm ||
          billing.estimatedPaymentAt ||
          billing.paidAt ||
          (billing.invoiceStatus &&
            billing.invoiceStatus !==
              CustomerServiceRecordInvoiceStatus.PENDING),
      );
      if (!hasData)
        throw StateConflictException.create(
          StateConflictExceptionCode.CUSTOMER_SERVICE_RECORD_INVOICE_CHANGED,
        );
      const archiveId = genId();
      await this.archives.create({
        id: archiveId,
        recordId,
        invoiceRevision: record.invoiceRevision,
        invoice,
        billing: {
          invoiceStatus: billing.invoiceStatus,
          issuedAt: billing.issuedAt,
          deliveredAt: billing.deliveredAt,
          paymentTerm: billing.paymentTerm,
          estimatedPaymentAt: billing.estimatedPaymentAt,
          paidAt: billing.paidAt,
        },
        archivedAt: new Date(),
        archivedBy: actorUserId,
      });
      record.archiveInvoice(actorUserId);
      const files =
        invoice.files.length +
        invoice.paymentComplements.reduce(
          (count, item) => count + item.files.length,
          0,
        );
      record.updateDetails(
        {
          attachmentsCount: Math.max(0, record.attachmentsCount - files),
          customerVisibleAttachmentsCount: Math.max(
            0,
            record.customerVisibleAttachmentsCount - files,
          ),
        },
        actorUserId,
      );
      const { data } = await this.writeRepository.archiveBillingInvoice(
        record,
        record.billingStatus as
          | CustomerServiceRecordBillingStatus.SUBMITTED
          | CustomerServiceRecordBillingStatus.INVOICED,
      );
      if (!data)
        throw StateConflictException.create(
          StateConflictExceptionCode.CUSTOMER_SERVICE_RECORD_INVOICE_CHANGED,
        );
      return {
        archiveId,
        record: BillingCustomerServiceRecordMapper.toViewDto(data),
      };
    });
  }
}
