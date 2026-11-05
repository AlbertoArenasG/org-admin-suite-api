import { CommandHandler, ICommand } from '@nestjs/cqrs';
import {
  BillingCustomerServiceRecordViewDto,
  CreateBillingCustomerServiceRecordPaymentComplementDto,
  UpdateBillingCustomerServiceRecordPaymentComplementDto,
} from '@application/dto/customer-service-record-billing';
import {
  ArchiveBillingCustomerServiceRecordInvoiceUseCase,
  CreateBillingCustomerServiceRecordPaymentComplementUseCase,
  UpdateBillingCustomerServiceRecordPaymentComplementUseCase,
} from '@application/use-cases/customer-service-record-billing';
import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';

export class CreateBillingCustomerServiceRecordPaymentComplementCommandAdapter
  implements ICommand
{
  private constructor(
    public readonly payload: CreateBillingCustomerServiceRecordPaymentComplementDto,
  ) {}
  static create(
    payload: CreateBillingCustomerServiceRecordPaymentComplementDto,
  ) {
    return new CreateBillingCustomerServiceRecordPaymentComplementCommandAdapter(
      payload,
    );
  }
}
@CommandHandler(
  CreateBillingCustomerServiceRecordPaymentComplementCommandAdapter,
)
export class CreateBillingCustomerServiceRecordPaymentComplementHandler extends BaseCommandHandler<
  CreateBillingCustomerServiceRecordPaymentComplementCommandAdapter,
  BillingCustomerServiceRecordViewDto
> {
  constructor(
    private readonly useCase: CreateBillingCustomerServiceRecordPaymentComplementUseCase,
  ) {
    super();
  }
  execute(
    command: CreateBillingCustomerServiceRecordPaymentComplementCommandAdapter,
  ) {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}

export class UpdateBillingCustomerServiceRecordPaymentComplementCommandAdapter
  implements ICommand
{
  private constructor(
    public readonly payload: UpdateBillingCustomerServiceRecordPaymentComplementDto,
  ) {}
  static create(
    payload: UpdateBillingCustomerServiceRecordPaymentComplementDto,
  ) {
    return new UpdateBillingCustomerServiceRecordPaymentComplementCommandAdapter(
      payload,
    );
  }
}
@CommandHandler(
  UpdateBillingCustomerServiceRecordPaymentComplementCommandAdapter,
)
export class UpdateBillingCustomerServiceRecordPaymentComplementHandler extends BaseCommandHandler<
  UpdateBillingCustomerServiceRecordPaymentComplementCommandAdapter,
  BillingCustomerServiceRecordViewDto
> {
  constructor(
    private readonly useCase: UpdateBillingCustomerServiceRecordPaymentComplementUseCase,
  ) {
    super();
  }
  execute(
    command: UpdateBillingCustomerServiceRecordPaymentComplementCommandAdapter,
  ) {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}

export class ArchiveBillingCustomerServiceRecordInvoiceCommandAdapter
  implements ICommand
{
  private constructor(
    public readonly recordId: string,
    public readonly actorUserId: string,
  ) {}
  static create(recordId: string, actorUserId: string) {
    return new ArchiveBillingCustomerServiceRecordInvoiceCommandAdapter(
      recordId,
      actorUserId,
    );
  }
}
@CommandHandler(ArchiveBillingCustomerServiceRecordInvoiceCommandAdapter)
export class ArchiveBillingCustomerServiceRecordInvoiceHandler extends BaseCommandHandler<
  ArchiveBillingCustomerServiceRecordInvoiceCommandAdapter,
  Awaited<
    ReturnType<ArchiveBillingCustomerServiceRecordInvoiceUseCase['execute']>
  >
> {
  constructor(
    private readonly useCase: ArchiveBillingCustomerServiceRecordInvoiceUseCase,
  ) {
    super();
  }
  execute(command: ArchiveBillingCustomerServiceRecordInvoiceCommandAdapter) {
    return this.run(command, () =>
      this.useCase.execute(command.recordId, command.actorUserId),
    );
  }
}
