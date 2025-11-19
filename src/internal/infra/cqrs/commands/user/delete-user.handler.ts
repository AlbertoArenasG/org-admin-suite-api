import { CommandHandler, ICommand } from '@nestjs/cqrs';

import { DeleteUserDto } from '@application/dto';
import { DeleteUserUseCase } from '@application/use-cases';
import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';

export class DeleteUserCommandAdapter implements ICommand {
  private constructor(public readonly payload: DeleteUserDto) {}

  static create(payload: DeleteUserDto) {
    return new DeleteUserCommandAdapter(payload);
  }
}

@CommandHandler(DeleteUserCommandAdapter)
export class DeleteUserHandler extends BaseCommandHandler<
  DeleteUserCommandAdapter,
  void
> {
  constructor(private readonly useCase: DeleteUserUseCase) {
    super();
  }

  async execute(command: DeleteUserCommandAdapter): Promise<void> {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}
