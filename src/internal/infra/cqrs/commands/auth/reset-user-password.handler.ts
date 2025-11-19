import { CommandHandler, ICommand } from '@nestjs/cqrs';

import { ResetUserPasswordDto } from '@application/dto';
import { ResetUserPasswordUseCase } from '@application/use-cases';
import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';

export class ResetUserPasswordCommandAdapter implements ICommand {
  private constructor(public readonly payload: ResetUserPasswordDto) {}

  static create(payload: ResetUserPasswordDto) {
    return new ResetUserPasswordCommandAdapter(payload);
  }
}

@CommandHandler(ResetUserPasswordCommandAdapter)
export class ResetUserPasswordHandler extends BaseCommandHandler<
  ResetUserPasswordCommandAdapter,
  void
> {
  constructor(private readonly useCase: ResetUserPasswordUseCase) {
    super();
  }

  async execute(adapter: ResetUserPasswordCommandAdapter): Promise<void> {
    return this.run(adapter, () => this.useCase.execute(adapter.payload));
  }
}
