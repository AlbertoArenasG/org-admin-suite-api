import { CommandHandler, ICommand } from '@nestjs/cqrs';
import {
  RefreshCustomerServiceRecordMaterializationsDto,
  RefreshCustomerServiceRecordMaterializationsResultDto,
} from '@application/dto';
import { RefreshCustomerServiceRecordMaterializationsUseCase } from '@application/use-cases';
import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';
export class RefreshCustomerServiceRecordMaterializationsCommandAdapter
  implements ICommand
{
  private constructor(
    public readonly payload: RefreshCustomerServiceRecordMaterializationsDto,
  ) {}
  static create(payload: RefreshCustomerServiceRecordMaterializationsDto) {
    return new RefreshCustomerServiceRecordMaterializationsCommandAdapter(
      payload,
    );
  }
}
@CommandHandler(RefreshCustomerServiceRecordMaterializationsCommandAdapter)
export class RefreshCustomerServiceRecordMaterializationsHandler extends BaseCommandHandler<
  RefreshCustomerServiceRecordMaterializationsCommandAdapter,
  RefreshCustomerServiceRecordMaterializationsResultDto
> {
  constructor(
    private readonly useCase: RefreshCustomerServiceRecordMaterializationsUseCase,
  ) {
    super();
  }
  async execute(
    command: RefreshCustomerServiceRecordMaterializationsCommandAdapter,
  ) {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}
