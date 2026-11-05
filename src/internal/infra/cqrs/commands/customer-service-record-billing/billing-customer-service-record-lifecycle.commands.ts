import { CommandHandler, ICommand } from '@nestjs/cqrs';
import {
  BillingCustomerServiceRecordViewDto,
  UpdateBillingCustomerServiceRecordDetailsDto,
  UpdateBillingCustomerServiceRecordInvoiceStatusDto,
  UpdateBillingCustomerServiceRecordPurchaseOrderDto,
} from '@application/dto/customer-service-record-billing';
import {
  UpdateBillingCustomerServiceRecordDetailsUseCase,
  UpdateBillingCustomerServiceRecordInvoiceStatusUseCase,
  UpdateBillingCustomerServiceRecordPurchaseOrderUseCase,
} from '@application/use-cases/customer-service-record-billing';
import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';

export class UpdateBillingCustomerServiceRecordDetailsCommandAdapter
  implements ICommand
{
  private constructor(
    public readonly payload: UpdateBillingCustomerServiceRecordDetailsDto,
  ) {}
  static create(payload: UpdateBillingCustomerServiceRecordDetailsDto) {
    return new this(payload);
  }
}
@CommandHandler(UpdateBillingCustomerServiceRecordDetailsCommandAdapter)
export class UpdateBillingCustomerServiceRecordDetailsHandler extends BaseCommandHandler<
  UpdateBillingCustomerServiceRecordDetailsCommandAdapter,
  BillingCustomerServiceRecordViewDto
> {
  constructor(
    private readonly useCase: UpdateBillingCustomerServiceRecordDetailsUseCase,
  ) {
    super();
  }
  execute(command: UpdateBillingCustomerServiceRecordDetailsCommandAdapter) {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}

export class UpdateBillingCustomerServiceRecordInvoiceStatusCommandAdapter
  implements ICommand
{
  private constructor(
    public readonly payload: UpdateBillingCustomerServiceRecordInvoiceStatusDto,
  ) {}
  static create(payload: UpdateBillingCustomerServiceRecordInvoiceStatusDto) {
    return new this(payload);
  }
}
@CommandHandler(UpdateBillingCustomerServiceRecordInvoiceStatusCommandAdapter)
export class UpdateBillingCustomerServiceRecordInvoiceStatusHandler extends BaseCommandHandler<
  UpdateBillingCustomerServiceRecordInvoiceStatusCommandAdapter,
  BillingCustomerServiceRecordViewDto
> {
  constructor(
    private readonly useCase: UpdateBillingCustomerServiceRecordInvoiceStatusUseCase,
  ) {
    super();
  }
  execute(
    command: UpdateBillingCustomerServiceRecordInvoiceStatusCommandAdapter,
  ) {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}

export class UpdateBillingCustomerServiceRecordPurchaseOrderCommandAdapter
  implements ICommand
{
  private constructor(
    public readonly payload: UpdateBillingCustomerServiceRecordPurchaseOrderDto,
  ) {}
  static create(payload: UpdateBillingCustomerServiceRecordPurchaseOrderDto) {
    return new this(payload);
  }
}
@CommandHandler(UpdateBillingCustomerServiceRecordPurchaseOrderCommandAdapter)
export class UpdateBillingCustomerServiceRecordPurchaseOrderHandler extends BaseCommandHandler<
  UpdateBillingCustomerServiceRecordPurchaseOrderCommandAdapter,
  BillingCustomerServiceRecordViewDto
> {
  constructor(
    private readonly useCase: UpdateBillingCustomerServiceRecordPurchaseOrderUseCase,
  ) {
    super();
  }
  execute(
    command: UpdateBillingCustomerServiceRecordPurchaseOrderCommandAdapter,
  ) {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}
