import { CommandHandler, ICommand } from '@nestjs/cqrs';

import {
  UpdateCustomerDto,
  CustomerFiscalProfileViewDto,
} from '@application/dto';
import { UpdateCustomerUseCase } from '@application/use-cases';
import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';

export class UpdateCustomerCommandAdapter implements ICommand {
  private constructor(public readonly payload: UpdateCustomerDto) {}

  static create(payload: UpdateCustomerDto) {
    return new UpdateCustomerCommandAdapter(payload);
  }
}

@CommandHandler(UpdateCustomerCommandAdapter)
export class UpdateCustomerHandler extends BaseCommandHandler<
  UpdateCustomerCommandAdapter,
  CustomerFiscalProfileViewDto
> {
  constructor(private readonly useCase: UpdateCustomerUseCase) {
    super();
  }

  async execute(
    command: UpdateCustomerCommandAdapter,
  ): Promise<CustomerFiscalProfileViewDto> {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}
