import { CommandHandler, ICommand } from '@nestjs/cqrs';

import { DeleteServiceEntryUseCase } from '@application/use-cases';
import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';

export class DeleteServiceEntryCommandAdapter implements ICommand {
  private constructor(public readonly serviceEntryId: string) {}

  static create(serviceEntryId: string) {
    return new DeleteServiceEntryCommandAdapter(serviceEntryId);
  }
}

@CommandHandler(DeleteServiceEntryCommandAdapter)
export class DeleteServiceEntryHandler extends BaseCommandHandler<
  DeleteServiceEntryCommandAdapter,
  void
> {
  constructor(private readonly useCase: DeleteServiceEntryUseCase) {
    super();
  }

  async execute(command: DeleteServiceEntryCommandAdapter): Promise<void> {
    return this.run(command, () =>
      this.useCase.execute(command.serviceEntryId),
    );
  }
}
