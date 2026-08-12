import { CommandHandler, ICommand } from '@nestjs/cqrs';

import { DeleteContactDto } from '@application/dto';
import { DeleteContactUseCase } from '@application/use-cases';
import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';

export class DeleteContactCommandAdapter implements ICommand {
  private constructor(public readonly payload: DeleteContactDto) {}

  static create(payload: DeleteContactDto) {
    return new DeleteContactCommandAdapter(payload);
  }
}

@CommandHandler(DeleteContactCommandAdapter)
export class DeleteContactHandler extends BaseCommandHandler<
  DeleteContactCommandAdapter,
  void
> {
  constructor(private readonly useCase: DeleteContactUseCase) {
    super();
  }

  async execute(command: DeleteContactCommandAdapter): Promise<void> {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}
