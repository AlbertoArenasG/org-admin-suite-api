import { CommandHandler, ICommand } from '@nestjs/cqrs';

import {
  CreateCustomerServiceRecordServiceTypeDto,
  CreateCustomerServiceRecordServiceTypeResultDto,
} from '@application/dto';
import { CreateCustomerServiceRecordServiceTypeUseCase } from '@application/use-cases';
import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';

export class CreateCustomerServiceRecordServiceTypeCommandAdapter
  implements ICommand
{
  private constructor(
    public readonly payload: CreateCustomerServiceRecordServiceTypeDto,
  ) {}

  static create(payload: CreateCustomerServiceRecordServiceTypeDto) {
    return new CreateCustomerServiceRecordServiceTypeCommandAdapter(payload);
  }
}

@CommandHandler(CreateCustomerServiceRecordServiceTypeCommandAdapter)
export class CreateCustomerServiceRecordServiceTypeHandler extends BaseCommandHandler<
  CreateCustomerServiceRecordServiceTypeCommandAdapter,
  CreateCustomerServiceRecordServiceTypeResultDto
> {
  constructor(
    private readonly useCase: CreateCustomerServiceRecordServiceTypeUseCase,
  ) {
    super();
  }

  async execute(command: CreateCustomerServiceRecordServiceTypeCommandAdapter) {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}
