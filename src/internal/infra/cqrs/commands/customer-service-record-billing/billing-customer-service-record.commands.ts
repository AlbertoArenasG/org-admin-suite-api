import { CommandHandler, ICommand } from '@nestjs/cqrs';
import {
  UpdateBillingCustomerServiceRecordInvoiceDto,
  UpdateBillingCustomerServiceRecordInvoiceResultDto,
  UpdateBillingCustomerServiceRecordStatusDto,
  UpdateBillingCustomerServiceRecordStatusResultDto,
} from '@application/dto/customer-service-record-billing';
import {
  UpdateBillingCustomerServiceRecordInvoiceUseCase,
  UpdateBillingCustomerServiceRecordStatusUseCase,
} from '@application/use-cases/customer-service-record-billing';
import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';

export class UpdateBillingCustomerServiceRecordStatusCommandAdapter
  implements ICommand
{
  private constructor(
    public readonly payload: UpdateBillingCustomerServiceRecordStatusDto,
  ) {}
  static create(payload: UpdateBillingCustomerServiceRecordStatusDto) {
    return new UpdateBillingCustomerServiceRecordStatusCommandAdapter(payload);
  }
}

@CommandHandler(UpdateBillingCustomerServiceRecordStatusCommandAdapter)
export class UpdateBillingCustomerServiceRecordStatusHandler extends BaseCommandHandler<
  UpdateBillingCustomerServiceRecordStatusCommandAdapter,
  UpdateBillingCustomerServiceRecordStatusResultDto
> {
  constructor(
    private readonly useCase: UpdateBillingCustomerServiceRecordStatusUseCase,
  ) {
    super();
  }
  async execute(
    command: UpdateBillingCustomerServiceRecordStatusCommandAdapter,
  ) {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}

export class UpdateBillingCustomerServiceRecordInvoiceCommandAdapter
  implements ICommand
{
  private constructor(
    public readonly payload: UpdateBillingCustomerServiceRecordInvoiceDto,
  ) {}
  static create(payload: UpdateBillingCustomerServiceRecordInvoiceDto) {
    return new UpdateBillingCustomerServiceRecordInvoiceCommandAdapter(payload);
  }
}

@CommandHandler(UpdateBillingCustomerServiceRecordInvoiceCommandAdapter)
export class UpdateBillingCustomerServiceRecordInvoiceHandler extends BaseCommandHandler<
  UpdateBillingCustomerServiceRecordInvoiceCommandAdapter,
  UpdateBillingCustomerServiceRecordInvoiceResultDto
> {
  constructor(
    private readonly useCase: UpdateBillingCustomerServiceRecordInvoiceUseCase,
  ) {
    super();
  }
  async execute(
    command: UpdateBillingCustomerServiceRecordInvoiceCommandAdapter,
  ) {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}
