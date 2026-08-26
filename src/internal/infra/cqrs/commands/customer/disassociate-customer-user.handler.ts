import { CommandHandler, ICommand } from '@nestjs/cqrs';

import {
  DisassociateCustomerUserDto,
  DisassociateCustomerUserResultDto,
} from '@application/dto';
import { DisassociateCustomerUserUseCase } from '@application/use-cases';
import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';

export class DisassociateCustomerUserCommandAdapter implements ICommand {
  private constructor(public readonly payload: DisassociateCustomerUserDto) {}

  static create(payload: DisassociateCustomerUserDto) {
    return new DisassociateCustomerUserCommandAdapter(payload);
  }
}

@CommandHandler(DisassociateCustomerUserCommandAdapter)
export class DisassociateCustomerUserHandler extends BaseCommandHandler<
  DisassociateCustomerUserCommandAdapter,
  DisassociateCustomerUserResultDto
> {
  constructor(private readonly useCase: DisassociateCustomerUserUseCase) {
    super();
  }

  async execute(
    command: DisassociateCustomerUserCommandAdapter,
  ): Promise<DisassociateCustomerUserResultDto> {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}
