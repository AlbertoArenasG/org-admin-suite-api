import { CommandHandler, ICommand } from '@nestjs/cqrs';

import {
  UpdateCustomerServiceRecordServiceTypeDto,
  UpdateCustomerServiceRecordServiceTypeResultDto,
} from '@application/dto';
import { UpdateCustomerServiceRecordServiceTypeUseCase } from '@application/use-cases';
import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';

export class UpdateCustomerServiceRecordServiceTypeCommandAdapter
  implements ICommand
{
  private constructor(
    public readonly payload: UpdateCustomerServiceRecordServiceTypeDto,
  ) {}

  static create(payload: UpdateCustomerServiceRecordServiceTypeDto) {
    return new UpdateCustomerServiceRecordServiceTypeCommandAdapter(payload);
  }
}

@CommandHandler(UpdateCustomerServiceRecordServiceTypeCommandAdapter)
export class UpdateCustomerServiceRecordServiceTypeHandler extends BaseCommandHandler<
  UpdateCustomerServiceRecordServiceTypeCommandAdapter,
  UpdateCustomerServiceRecordServiceTypeResultDto
> {
  constructor(
    private readonly useCase: UpdateCustomerServiceRecordServiceTypeUseCase,
  ) {
    super();
  }

  async execute(command: UpdateCustomerServiceRecordServiceTypeCommandAdapter) {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}
