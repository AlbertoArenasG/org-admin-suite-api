import { CommandHandler, ICommand } from '@nestjs/cqrs';

import { DeleteCustomerUseCase } from '@application/use-cases';
import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';

export class DeleteCustomerCommandAdapter implements ICommand {
  private constructor(public readonly customerId: string) {}

  static create(customerId: string) {
    return new DeleteCustomerCommandAdapter(customerId);
  }
}

@CommandHandler(DeleteCustomerCommandAdapter)
export class DeleteCustomerHandler extends BaseCommandHandler<
  DeleteCustomerCommandAdapter,
  void
> {
  constructor(private readonly useCase: DeleteCustomerUseCase) {
    super();
  }

  async execute(command: DeleteCustomerCommandAdapter): Promise<void> {
    return this.run(command, () => this.useCase.execute(command.customerId));
  }
}
