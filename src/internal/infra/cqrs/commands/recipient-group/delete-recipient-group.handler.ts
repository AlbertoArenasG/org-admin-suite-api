import { CommandHandler, ICommand } from '@nestjs/cqrs';

import { DeleteRecipientGroupDto } from '@application/dto';
import { DeleteRecipientGroupUseCase } from '@application/use-cases';
import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';

export class DeleteRecipientGroupCommandAdapter implements ICommand {
  private constructor(public readonly payload: DeleteRecipientGroupDto) {}

  static create(payload: DeleteRecipientGroupDto) {
    return new DeleteRecipientGroupCommandAdapter(payload);
  }
}

@CommandHandler(DeleteRecipientGroupCommandAdapter)
export class DeleteRecipientGroupHandler extends BaseCommandHandler<
  DeleteRecipientGroupCommandAdapter,
  void
> {
  constructor(private readonly useCase: DeleteRecipientGroupUseCase) {
    super();
  }

  async execute(command: DeleteRecipientGroupCommandAdapter): Promise<void> {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}
