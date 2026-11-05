import { CommandHandler, ICommand } from '@nestjs/cqrs';
import {
  BillingRecordComment,
  BillingRecordCommentVisibility,
} from '@domain/entities';
import { CreateBillingCustomerServiceRecordCommentUseCase } from '@application/use-cases/customer-service-record-billing';
import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';

export class CreateBillingCustomerServiceRecordCommentCommandAdapter
  implements ICommand
{
  private constructor(
    public readonly payload: {
      recordId: string;
      text: string;
      visibility: BillingRecordCommentVisibility;
      actorUserId: string;
    },
  ) {}
  static create(payload: {
    recordId: string;
    text: string;
    visibility: BillingRecordCommentVisibility;
    actorUserId: string;
  }) {
    return new CreateBillingCustomerServiceRecordCommentCommandAdapter(payload);
  }
}
@CommandHandler(CreateBillingCustomerServiceRecordCommentCommandAdapter)
export class CreateBillingCustomerServiceRecordCommentHandler extends BaseCommandHandler<
  CreateBillingCustomerServiceRecordCommentCommandAdapter,
  BillingRecordComment
> {
  constructor(
    private readonly useCase: CreateBillingCustomerServiceRecordCommentUseCase,
  ) {
    super();
  }
  execute(command: CreateBillingCustomerServiceRecordCommentCommandAdapter) {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}
