import { CommandHandler, ICommand } from '@nestjs/cqrs';

import {
  AssociateCustomerUserDto,
  AssociateCustomerUserResultDto,
} from '@application/dto';
import { AssociateCustomerUserUseCase } from '@application/use-cases';
import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';

export class AssociateCustomerUserCommandAdapter implements ICommand {
  private constructor(public readonly payload: AssociateCustomerUserDto) {}

  static create(payload: AssociateCustomerUserDto) {
    return new AssociateCustomerUserCommandAdapter(payload);
  }
}

@CommandHandler(AssociateCustomerUserCommandAdapter)
export class AssociateCustomerUserHandler extends BaseCommandHandler<
  AssociateCustomerUserCommandAdapter,
  AssociateCustomerUserResultDto
> {
  constructor(private readonly useCase: AssociateCustomerUserUseCase) {
    super();
  }

  async execute(
    command: AssociateCustomerUserCommandAdapter,
  ): Promise<AssociateCustomerUserResultDto> {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}
