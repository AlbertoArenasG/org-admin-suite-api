import { CommandHandler, ICommand } from '@nestjs/cqrs';

import {
  CreateCustomerFiscalProfileDto,
  CreateCustomerFiscalProfileResultDto,
} from '@application/dto';
import { CreateCustomerFiscalProfileUseCase } from '@application/use-cases';
import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';

export class CreateCustomerFiscalProfileCommandAdapter implements ICommand {
  private constructor(
    public readonly payload: CreateCustomerFiscalProfileDto,
  ) {}

  static create(payload: CreateCustomerFiscalProfileDto) {
    return new CreateCustomerFiscalProfileCommandAdapter(payload);
  }
}

@CommandHandler(CreateCustomerFiscalProfileCommandAdapter)
export class CreateCustomerFiscalProfileHandler extends BaseCommandHandler<
  CreateCustomerFiscalProfileCommandAdapter,
  CreateCustomerFiscalProfileResultDto
> {
  constructor(private readonly useCase: CreateCustomerFiscalProfileUseCase) {
    super();
  }

  async execute(
    command: CreateCustomerFiscalProfileCommandAdapter,
  ): Promise<CreateCustomerFiscalProfileResultDto> {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}
