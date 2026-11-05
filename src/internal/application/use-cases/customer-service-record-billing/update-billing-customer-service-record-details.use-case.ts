import { Inject, Injectable } from '@nestjs/common';
import {
  UpdateBillingCustomerServiceRecordDetailsDto,
  BillingCustomerServiceRecordViewDto,
} from '@application/dto/customer-service-record-billing';
import { BillingCustomerServiceRecordMapper } from '@application/mappers/customer-service-record-billing';
import { CustomerServiceRecordBillingStatus } from '@domain/entities';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
  StateConflictException,
  StateConflictExceptionCode,
} from '@domain/exceptions';
import { CustomerServiceRecordInvoicePolicy } from '@domain/policies';
import {
  IBillingCustomerServiceRecordReadRepository,
  IBillingCustomerServiceRecordReadRepositoryToken,
  ICustomerServiceRecordWriteRepository,
  ICustomerServiceRecordWriteRepositoryToken,
} from '@domain/ports/repositories';

@Injectable()
export class UpdateBillingCustomerServiceRecordDetailsUseCase {
  constructor(
    @Inject(IBillingCustomerServiceRecordReadRepositoryToken)
    private readonly readRepository: IBillingCustomerServiceRecordReadRepository,
    @Inject(ICustomerServiceRecordWriteRepositoryToken)
    private readonly writeRepository: ICustomerServiceRecordWriteRepository,
  ) {}

  async execute(
    input: UpdateBillingCustomerServiceRecordDetailsDto,
  ): Promise<BillingCustomerServiceRecordViewDto> {
    const { data: record } = await this.readRepository.findById(input.recordId);
    if (!record)
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.CUSTOMER_SERVICE_RECORD,
        { recordId: input.recordId },
      );
    const todayParts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Mexico_City',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date());
    const part = (type: string) =>
      todayParts.find((value) => value.type === type)!.value;
    const today = `${part('year')}-${part('month')}-${part('day')}`;
    const next = CustomerServiceRecordInvoicePolicy.afterDetailsChange(
      record.billing,
      input.changes,
      today,
    );
    record.updateInvoiceBilling(next, input.actorUserId);
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
