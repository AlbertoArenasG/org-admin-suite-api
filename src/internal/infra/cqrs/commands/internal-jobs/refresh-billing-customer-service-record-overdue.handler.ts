import { CommandHandler, ICommand } from '@nestjs/cqrs';
import { RefreshBillingCustomerServiceRecordOverdueUseCase } from '@application/use-cases/customer-service-record-billing';
import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';

export class RefreshBillingCustomerServiceRecordOverdueCommandAdapter
  implements ICommand
{
  private constructor(public readonly payload: { cursor: string | null }) {}
  static create(payload: { cursor: string | null }) {
    return new RefreshBillingCustomerServiceRecordOverdueCommandAdapter(
      payload,
    );
  }
}
@CommandHandler(RefreshBillingCustomerServiceRecordOverdueCommandAdapter)
export class RefreshBillingCustomerServiceRecordOverdueHandler extends BaseCommandHandler<
  RefreshBillingCustomerServiceRecordOverdueCommandAdapter,
  Awaited<
    ReturnType<RefreshBillingCustomerServiceRecordOverdueUseCase['execute']>
  >
> {
  constructor(
    private readonly useCase: RefreshBillingCustomerServiceRecordOverdueUseCase,
  ) {
    super();
  }
  execute(command: RefreshBillingCustomerServiceRecordOverdueCommandAdapter) {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}
