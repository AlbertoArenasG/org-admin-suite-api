import { CommandHandler, ICommand } from '@nestjs/cqrs';

import {
  SubmitCustomerFiscalProfileDto,
  CustomerFiscalProfileViewDto,
} from '@application/dto';
import { SubmitCustomerFiscalProfileUseCase } from '@application/use-cases';
import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';

export class SubmitCustomerFiscalProfileCommandAdapter implements ICommand {
  private constructor(
    public readonly payload: SubmitCustomerFiscalProfileDto,
  ) {}

  static create(payload: SubmitCustomerFiscalProfileDto) {
    return new SubmitCustomerFiscalProfileCommandAdapter(payload);
  }
}

@CommandHandler(SubmitCustomerFiscalProfileCommandAdapter)
export class SubmitCustomerFiscalProfileHandler extends BaseCommandHandler<
  SubmitCustomerFiscalProfileCommandAdapter,
  CustomerFiscalProfileViewDto
> {
  constructor(private readonly useCase: SubmitCustomerFiscalProfileUseCase) {
    super();
  }

  async execute(
    command: SubmitCustomerFiscalProfileCommandAdapter,
  ): Promise<CustomerFiscalProfileViewDto> {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}
