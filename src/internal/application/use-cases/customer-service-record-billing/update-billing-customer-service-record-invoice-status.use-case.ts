import { Inject, Injectable } from '@nestjs/common';
import {
  UpdateBillingCustomerServiceRecordInvoiceStatusDto,
  BillingCustomerServiceRecordViewDto,
} from '@application/dto/customer-service-record-billing';
import { BillingCustomerServiceRecordMapper } from '@application/mappers/customer-service-record-billing';
import {
  CustomerServiceRecordInvoiceStatus,
  CustomerServiceRecordBillingStatus,
} from '@domain/entities';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
  InvalidValueException,
  InvalidValueExceptionCode,
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
export class UpdateBillingCustomerServiceRecordInvoiceStatusUseCase {
  constructor(
    @Inject(IBillingCustomerServiceRecordReadRepositoryToken)
    private readonly readRepository: IBillingCustomerServiceRecordReadRepository,
    @Inject(ICustomerServiceRecordWriteRepositoryToken)
    private readonly writeRepository: ICustomerServiceRecordWriteRepository,
  ) {}

  async execute(
    input: UpdateBillingCustomerServiceRecordInvoiceStatusDto,
  ): Promise<BillingCustomerServiceRecordViewDto> {
    if (
      !Object.values(CustomerServiceRecordInvoiceStatus).includes(
        input.invoiceStatus,
      )
    )
      throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
        field: 'invoice_status',
        value: input.invoiceStatus,
      });
    const { data: record } = await this.readRepository.findById(input.recordId);
    if (!record)
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.CUSTOMER_SERVICE_RECORD,
        { recordId: input.recordId },
      );
    record.updateInvoiceBilling(
      { ...record.billing, invoiceStatus: input.invoiceStatus },
      input.actorUserId,
    );
    const { data } = await this.writeRepository.updateBillingLifecycle(
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
