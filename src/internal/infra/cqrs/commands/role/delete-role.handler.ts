import { CommandHandler, ICommand } from '@nestjs/cqrs';

import { DeleteRoleDto } from '@application/dto';
import { DeleteRoleUseCase } from '@application/use-cases';
import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';

export class DeleteRoleCommandAdapter implements ICommand {
  private constructor(public readonly payload: DeleteRoleDto) {}

  static create(payload: DeleteRoleDto) {
    return new DeleteRoleCommandAdapter(payload);
  }
}

@CommandHandler(DeleteRoleCommandAdapter)
export class DeleteRoleHandler extends BaseCommandHandler<
  DeleteRoleCommandAdapter,
  void
> {
  constructor(private readonly useCase: DeleteRoleUseCase) {
    super();
  }

  async execute(command: DeleteRoleCommandAdapter): Promise<void> {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}
