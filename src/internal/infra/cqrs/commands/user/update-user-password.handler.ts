import { CommandHandler, ICommand } from '@nestjs/cqrs';

import { UpdateUserPasswordDto } from '@application/dto';
import { UpdateUserPasswordUseCase } from '@application/use-cases';
import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';

export class UpdateUserPasswordCommandAdapter implements ICommand {
  private constructor(public readonly payload: UpdateUserPasswordDto) {}

  static create(payload: UpdateUserPasswordDto) {
    return new UpdateUserPasswordCommandAdapter(payload);
  }
}

@CommandHandler(UpdateUserPasswordCommandAdapter)
export class UpdateUserPasswordHandler extends BaseCommandHandler<
  UpdateUserPasswordCommandAdapter,
  void
> {
  constructor(private readonly useCase: UpdateUserPasswordUseCase) {
    super();
  }

  async execute(command: UpdateUserPasswordCommandAdapter): Promise<void> {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}
