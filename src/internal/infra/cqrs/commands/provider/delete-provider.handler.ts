import { CommandHandler, ICommand } from '@nestjs/cqrs';

import { DeleteProviderUseCase } from '@application/use-cases';
import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';

export class DeleteProviderCommandAdapter implements ICommand {
  private constructor(public readonly providerId: string) {}

  static create(providerId: string) {
    return new DeleteProviderCommandAdapter(providerId);
  }
}

@CommandHandler(DeleteProviderCommandAdapter)
export class DeleteProviderHandler extends BaseCommandHandler<
  DeleteProviderCommandAdapter,
  void
> {
  constructor(private readonly useCase: DeleteProviderUseCase) {
    super();
  }

  async execute(command: DeleteProviderCommandAdapter): Promise<void> {
    return this.run(command, () => this.useCase.execute(command.providerId));
  }
}
